import { EVENT_ADD_PEER, EVENT_JOIN, EVENT_MY_MOVE, EVENT_REMOVE_PEER, EVENT_THEIR_MOVE, FPS_CLIENT, FPS_MESSAGE, IS_DEBUG, ROOM_MAIN, ROOM_WAITING } from "../common/constants";
import BaseClientApp from "./BaseClientApp";
import Stats from "stats.js";
import * as animate from 'animate';
import * as THREE from "three";
import getAmmoLibAsync from "./utils/ammo_loader";
import AmmoAndThreeConverter from "./utils/AmmoAndThreeConverter";
import AmmoObjectSweeper from "./utils/AmmoObjectSweeper";
import MyPlayer from "./Player/MyPlayer";
import TheirPlayer from "./Player/TheirPlayer";
import PacketThreeConverter from "../libs/PacketThreeConverter";

// import { GPUStatsPanel } from 'three/examples/jsm/utils/GPUStatsPanel.js'


export default class MainClientApp extends BaseClientApp{
  constructor({localVideo,iceServers,view,setJoined}){
    super({localVideo,iceServers,room:ROOM_WAITING,view,setJoined});
    this.updateCount=0;
  }
  /**
   * @override
   */
   async setupAsync(){
    const { GPUStatsPanel }=await import('three/examples/jsm/utils/GPUStatsPanel.js');
    const AmmoLib=await getAmmoLibAsync();
    this.dynamicImports={
      GPUStatsPanel,
      AmmoLib,
    };

    this.setRemoteList=this.onSetRemoteList.bind(this);


    this.setupStats();
    await super.setupAsync();
    await this.setupThreeAsync();
    await this.setupAmmoAsync();
    this.setupEvents();
  }
  /**
   * @override
   */
   async destroyAsync(){
    this.destroyEvents();
    await this.destroyAmmoAsync();
    await this.destroyThreeAsync();
    await super.destroyAsync();
    this.destroyStats();
  }
  /**
   * @override
   */
   setupSocketIo(){
    super.setupSocketIo();
    const {socket}=this;
    socket.on(EVENT_ADD_PEER,this.getBind("onAddPeerAsync"));
    socket.on(EVENT_REMOVE_PEER,this.getBind("onRemovePeerAsync"));
    socket.on(EVENT_THEIR_MOVE,this.getBind("onTheirMoveAsync"));
    
  }
  /**
   * @override
   */
   destroySocketIo(){
    super.destroySocketIo();
  }
 
  setupStats() {
    const stats = new Stats();
    // stats.dom.id="Stats";
    stats.dom.style.left = "auto";
    stats.dom.style.right = "0";
    document.body.appendChild(stats.dom);
    if (!IS_DEBUG) {
      stats.dom.style.display = "none";
    }

    this.stats = stats;
  }
  destroyStats() {
    const { stats } = this;
    stats.dom.remove();
  }
  async setupThreeAsync(){
    const {GPUStatsPanel}=this.dynamicImports;
    const packetThreeConverter=new PacketThreeConverter({THREE});

    const {stats,view}=this;
    if(IS_DEBUG){
      console.log(`three.js ${THREE.REVISION}`);
      console.log(GPUStatsPanel);
      console.log(view);
    }
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.y = 2;
    camera.position.z = 5;

    const listener=new THREE.AudioListener();
    camera.add(listener);
  

    const renderer = new THREE.WebGLRenderer( {
      antialias: true,
      canvas:view,
    } );
    // renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setPixelRatio( 1 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const gpuPanel = new GPUStatsPanel( renderer.getContext() );
    stats.addPanel( gpuPanel );
    stats.showPanel( 0 );

    // const ambientLight=new THREE.AmbientLight(0xc0c0c0);
    const ambientLight=new THREE.HemisphereLight( 0xc0c0c0, 0x404040, 1 );
    scene.add(ambientLight);
    const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
    light.position.set(10,10,10);
    light.castShadow = true;
    scene.add( light );

    const loader = new THREE.CubeTextureLoader();
    loader.setPath( 'assets/textures/cube/Bridge2/' );

    const textureCube = loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );
    textureCube.encoding = THREE.sRGBEncoding;
    scene.background = textureCube;
    scene.environment=textureCube;


    
    const ground = new THREE.Mesh(
      // new THREE.BoxGeometry(100,100,100),
      new THREE.SphereGeometry( 15, 32, 16 ),
      new THREE.MeshStandardMaterial( { color: 0xffffff } )
    );
    scene.add( ground );
    ground.position.x=1;
    ground.position.z=1;
    ground.position.y=-15;
    ground.receiveShadow=true;

    this.three={
      clock,
      scene,
      camera,
      listener,
      renderer,
      gpuPanel,
      myPlayer:null,
      theirPlayerList:[],
      packetThreeConverter,
    };
  
  }
  async destroyThreeAsync(){
    const {
      scene,
    } = this.three;
    scene.traverse((object3d) => {
      if (object3d instanceof THREE.Mesh) {
        const mesh = object3d;
        const { geometry, material } = mesh;
        geometry.dispose();
        material.dispose();
      }
    });
  }
  async setupAmmoAsync(){
    const {AmmoLib}=this.dynamicImports;
    const ammoObjectSweeper=new AmmoObjectSweeper(AmmoLib);
    const ammoAndThreeConverter=new AmmoAndThreeConverter({
      THREE,
      AmmoLib,
    });

    this.ammo={
      ammoObjectSweeper,
      ammoAndThreeConverter,
    };
  }
  async destroyAmmoAsync(){
    const {ammoObjectSweeper}=this.ammo;
    ammoObjectSweeper.destroyPermanentObjects();

  }
  setupEvents() {
    const { stats } = this;


    window.addEventListener("resize", this.getBind("onResize"));


    const onTickAsyncInternal = async () => {
      stats.begin();
      await this.onTickAsync();
      stats.end();
    };

    let animationState = "ready";
    this.animation = animate(async () => {
      if (animationState != "ready") {
        // console.log("skip frame");
        return;
      }
      animationState = "executing";
      //async call
      let promise = onTickAsyncInternal();
      promise.then(() => {
        animationState = "ready";
      });
    }, FPS_CLIENT);

  }
  destroyEvents() {
    this.animation.pause();
    window.removeEventListener("resize", this.getBind("onResize"));
  }

  onClickJoin(){
    const {localVideo}=this;
    const {scene}=this.three;
    const myPlayer=new MyPlayer();
    scene.add(myPlayer);
    myPlayer.setVideo(localVideo);

    Object.assign(this.three,{
      myPlayer,
    });

    const {socket}=this;
    socket.emit(EVENT_JOIN,{
      room:ROOM_MAIN,
    },(wasSucceeded)=>{
      this.setJoined(wasSucceeded);
    });

  }
  update(){
    const {myPlayer,packetThreeConverter}=this.three;
    const {socket}=this;
    const {ammoObjectSweeper}=this.ammo;

    ammoObjectSweeper.destroyTemporaryObjects();

    if(myPlayer){
      // myPlayer.position.x+=0.01;
      // const euler=new THREE.Euler();
      // euler.x=Math.random()*Math.PI*2;
      // euler.y=Math.random()*Math.PI*2;
      // euler.z=Math.random()*Math.PI*2;
      // myPlayer.quaternion.setFromEuler(euler);
      const myData={
        transform:{
          position:packetThreeConverter.convertVector3ThreeToPacket(myPlayer.position),
          quaternion:packetThreeConverter.convertQuaternionThreeToPacket(myPlayer.quaternion),
        },
      };
      // socket.emit(EVENT_MY_MOVE,myData);
      const cpm= FPS_CLIENT / FPS_MESSAGE;
      if(this.updateCount%cpm==0){
        socket.emit(EVENT_MY_MOVE,myData);
      }
  
    }
    this.updateCount+=1;

  }
  render(){
    const {
      renderer,
      scene,
      camera,
      gpuPanel,
    } = this.three;
    gpuPanel.startQuery();
    renderer.render(scene, camera);
    gpuPanel.endQuery();

  }
  async onTickAsync() {
    this.update();
    this.render();
  }
  getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  onResize(){
    const size = this.getSize();
    const { camera, renderer } = this.three;

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height);

  }
  onSetRemoteList(){
    console.log("MainClientApp#onSetRemoteList");
    console.log(`this.remoteList.length:${this.remoteList.length}`);
    const {theirPlayerList,listener}=this.three;
    const previousPeerIdList=this.previousRemoteList.map((theirPlayer)=>theirPlayer.peerId);
    const currentPeerIdList=this.remoteList.map((remote)=>remote.peerId);
    const removedPeerIdList=previousPeerIdList.filter(
      (previousPeerId)=>!currentPeerIdList.includes(previousPeerId)
    );
    const addedPeerIdList=currentPeerIdList.filter(
      (currentPeerId)=>!previousPeerIdList.includes(currentPeerId)
    );
    for(let removedPeerId of removedPeerIdList){
      const theirPlayer=theirPlayerList.find((theirPlayer)=>theirPlayer.peerId==removedPeerId);
      if(theirPlayer){
        theirPlayer.setVideo(null);
      }
    }
    for(let addedPeerId of addedPeerIdList){
      const theirPlayer=theirPlayerList.find((theirPlayer)=>theirPlayer.peerId==addedPeerId);
      if(theirPlayer){
        const remote=this.remoteList.find((remote)=>remote.peerId==addedPeerId);

        const setupVideo=()=>{
          const sound=new THREE.PositionalAudio(listener);
          sound.setRefDistance( 3 );// 3[m]
          sound.setRolloffFactor( 1 );
          sound.setDistanceModel("exponential");
  
          const mediaStreamSource = sound.context.createMediaStreamSource(remote.stream);
          sound.setNodeSource(mediaStreamSource);
  
          theirPlayer.add(sound);

          const video=document.createElement("video");
          video.autoplay=true;
          video.playsinline=true;
          video.muted=true;
          video.style="position:relative;opacity:0;width:1px;height:1px;pointer-events:none;";
          document.body.appendChild(video);
          theirPlayer.setVideo(video);
          video.srcObject=remote.stream;
          Object.assign(theirPlayer.userData,{
            video,
          });
          console.log("new video");
  
        }
        // イベントでうまく捕捉できないのでダーティーに対処する
        const intervalTimerId=setInterval(()=>{
          const aLength=remote.stream.getAudioTracks().length;
          const vLength=remote.stream.getVideoTracks().length;
          if(0<aLength && 0<vLength){
            setupVideo();
            clearInterval(intervalTimerId);
          }
        },100);
      }else{
        console.error("theirPlayer==null");
      }
    }
      
  }

  async onAddPeerAsync({peerId}){
    console.log("MainClientApp#onAddPeerAsync",peerId);
    const {theirPlayerList,scene}=this.three;
    const theirPlayer=new TheirPlayer(peerId);
    theirPlayerList.push(theirPlayer);
    scene.add(theirPlayer);
  }
  async onRemovePeerAsync({peerId}){
    console.log("MainClientApp#onRemovePeerAsync",peerId);
    const {theirPlayerList,scene}=this.three;

    const theirPlayer=theirPlayerList.find((theirPlayer)=>theirPlayer.peerId==peerId);
    if(theirPlayer){
      scene.remove(theirPlayer);
      this.three.theirPlayerList=theirPlayerList.filter((theirPlayer)=>theirPlayer.peerId!=peerId);

      const {video}=theirPlayer.userData;
      document.body.removeChild(video);
    }
    
  }
  async onTheirMoveAsync({peerId,transform}){
    // console.log("MainClientApp#onTheirMoveAsync",peerId);
    // console.log(peerId,JSON.stringify(transform));
    const {theirPlayerList,packetThreeConverter}=this.three;

    const theirPlayer=theirPlayerList.find((theirPlayer)=>theirPlayer.peerId==peerId);
    if(theirPlayer){
      packetThreeConverter.convertVector3PacketToThree(transform.position,theirPlayer.position);
      packetThreeConverter.convertQuaternionPacketToThree(transform.quaternion,theirPlayer.quaternion);

    }
  }


}