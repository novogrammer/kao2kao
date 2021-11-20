import { BUTTON_NAME_CAMERA_DOWN, BUTTON_NAME_CAMERA_LEFT, BUTTON_NAME_CAMERA_RIGHT, BUTTON_NAME_CAMERA_UP, BUTTON_NAME_MOVE_BACKWARD, BUTTON_NAME_MOVE_FORWARD, BUTTON_NAME_MOVE_LEFT, BUTTON_NAME_MOVE_RIGHT, CAPSULE_HEIGHT, DISABLE_DEACTIVATION, EVENT_ADD_PEER, EVENT_JOIN, EVENT_MY_MOVE, EVENT_POPULATION, EVENT_REMOVE_PEER, EVENT_THEIR_MOVE, FPS_CLIENT, FPS_MESSAGE, IS_DEBUG, IS_DEBUG_CAMERA, KEY_CODE_ARROW_DOWN, KEY_CODE_ARROW_LEFT, KEY_CODE_ARROW_RIGHT, KEY_CODE_ARROW_UP, KEY_CODE_KEY_A, KEY_CODE_KEY_D, KEY_CODE_KEY_S, KEY_CODE_KEY_W, ROOM_MAIN, ROOM_WAITING } from "../common/constants";
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
import ButtonState from "./utils/ButtonState";

// import { GPUStatsPanel } from 'three/examples/jsm/utils/GPUStatsPanel.js'


export default class MainClientApp extends BaseClientApp{
  constructor({localVideo,iceServers,view,setJoined,setPopulations}){
    super({localVideo,iceServers,room:ROOM_WAITING,view,setJoined,setPopulations});
    this.updateCount=0;
  }
  /**
   * @override
   */
   async setupAsync(){
    const { GPUStatsPanel }=await import('three/examples/jsm/utils/GPUStatsPanel.js');
    const { GLTFLoader }=await import('three/examples/jsm/loaders/GLTFLoader.js');
    const SkeletonUtils=await import('three/examples/jsm/utils/SkeletonUtils.js');
    
    const AmmoLib=await getAmmoLibAsync();
    this.dynamicImports={
      GPUStatsPanel,
      GLTFLoader,
      SkeletonUtils,
      AmmoLib,
    };

    this.setRemoteList=this.onSetRemoteList.bind(this);

    this.buttonStateMap=new Map([
      [KEY_CODE_KEY_W,new ButtonState()],
      [KEY_CODE_KEY_A,new ButtonState()],
      [KEY_CODE_KEY_S,new ButtonState()],
      [KEY_CODE_KEY_D,new ButtonState()],
      [KEY_CODE_ARROW_UP,new ButtonState()],
      [KEY_CODE_ARROW_LEFT,new ButtonState()],
      [KEY_CODE_ARROW_DOWN,new ButtonState()],
      [KEY_CODE_ARROW_RIGHT,new ButtonState()],
      [BUTTON_NAME_MOVE_FORWARD,new ButtonState()],
      [BUTTON_NAME_MOVE_LEFT,new ButtonState()],
      [BUTTON_NAME_MOVE_BACKWARD,new ButtonState()],
      [BUTTON_NAME_MOVE_RIGHT,new ButtonState()],
      [BUTTON_NAME_CAMERA_UP,new ButtonState()],
      [BUTTON_NAME_CAMERA_LEFT,new ButtonState()],
      [BUTTON_NAME_CAMERA_DOWN,new ButtonState()],
      [BUTTON_NAME_CAMERA_RIGHT,new ButtonState()],
    ]);

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
    socket.on(EVENT_POPULATION,this.getBind("onPopulationAsync"));
    
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
    const {GPUStatsPanel,GLTFLoader}=this.dynamicImports;
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
    light.position.set(0,10,0);
    light.castShadow = true;
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default
    const cameraRectSize=20;
    light.shadow.camera.left=cameraRectSize*-0.5;
    light.shadow.camera.bottom=cameraRectSize*-0.5;
    light.shadow.camera.right=cameraRectSize*0.5;
    light.shadow.camera.top=cameraRectSize*0.5;
    light.shadow.normalBias=0.05;

    scene.add( light );

    const cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath( 'assets/textures/cube/Bridge2/' );

    const textureCube = cubeTextureLoader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );
    textureCube.encoding = THREE.sRGBEncoding;
    scene.background = textureCube;
    scene.environment=textureCube;

    const gltfLoader=new GLTFLoader();
    gltfLoader.setPath('assets/models/');
    const originalHanpenGltf=await new Promise((resolve,reject)=>{
      gltfLoader.load('hanpen_animation.glb',resolve,null,reject);
    });
    // console.log(originalHanpenGltf);


    const groundGroup=new THREE.Group();
    scene.add( groundGroup );
    {
      const size=20;
      const ground = new THREE.Mesh(
        // new THREE.BoxGeometry(100,100,100),
        new THREE.BoxGeometry(size,size,size),
        // new THREE.SphereGeometry( 15, 32, 16 ),
        new THREE.MeshStandardMaterial( {
           color: 0xffffff ,
           side:THREE.DoubleSide,
          } )
      );
      ground.geometry.scale(-1,1,1);//flip normal
      ground.geometry.computeVertexNormals();
      ground.position.y=size/2;
      ground.castShadow=true;
      ground.receiveShadow=true;
      groundGroup.add(ground);
    }
    {
      const size=5;
      const ground = new THREE.Mesh(
        // new THREE.BoxGeometry(100,100,100),
        new THREE.BoxGeometry(size,size,size),
        // new THREE.SphereGeometry( 15, 32, 16 ),
        new THREE.MeshStandardMaterial( {
           color: 0xffffff ,
          } )
      );
      ground.position.y=-1;
      ground.position.z=-5;
      ground.rotation.z=THREE.MathUtils.degToRad(30);
      ground.castShadow=true;
      ground.receiveShadow=true;
      groundGroup.add(ground);
    }

    this.three={
      clock,
      scene,
      camera,
      listener,
      renderer,
      gpuPanel,
      groundGroup,
      myPlayer:null,
      originalHanpenGltf,
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
    const {groundGroup}=this.three;
    const {AmmoLib}=this.dynamicImports;
    const ammoObjectSweeper=new AmmoObjectSweeper(AmmoLib);
    const ammoAndThreeConverter=new AmmoAndThreeConverter({
      THREE,
      AmmoLib,
    });
    const markT=ammoObjectSweeper.markTemporary.bind(ammoObjectSweeper);
    const markP=ammoObjectSweeper.markPermanent.bind(ammoObjectSweeper);
  
    //準備
    const collisionConfiguration = markP(new AmmoLib.btDefaultCollisionConfiguration());
    const dispatcher = markP(new AmmoLib.btCollisionDispatcher(collisionConfiguration));
    const overlappingPairCache = markP(new AmmoLib.btDbvtBroadphase());
    const solver = markP(new AmmoLib.btSequentialImpulseConstraintSolver());
    const dynamicsWorld = markP(new AmmoLib.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration));
    dynamicsWorld.setGravity(markT(new AmmoLib.btVector3(0, -10, 0)));

    const bodies = [];
    // 地形
    groundGroup.traverse((object3D)=>{
      if(object3D.isMesh){
        const mesh=object3D;
        const triangleMesh=markP(new AmmoLib.btTriangleMesh());
        if(mesh.geometry.index){
          const {index}=mesh.geometry;
          const position=mesh.geometry.getAttribute("position");
          for(let i=0;i<index.count;i+=3){
            const a=index.getX(i+0);
            const b=index.getX(i+1);
            const c=index.getX(i+2);
    
            triangleMesh.addTriangle(
              markT(new AmmoLib.btVector3(
                position.getX(a),
                position.getY(a),
                position.getZ(a),
              )),
              markT(new AmmoLib.btVector3(
                position.getX(b),
                position.getY(b),
                position.getZ(b),
              )),
              markT(new AmmoLib.btVector3(
                position.getX(c),
                position.getY(c),
                position.getZ(c),
              ))
            );
          }
        
        }else{
          const position=mesh.geometry.getAttribute("position");
          for(let i=0;i<position.count;i+=3){
            const a=i+0;
            const b=i+1;
            const c=i+2;
            triangleMesh.addTriangle(
              markT(new AmmoLib.btVector3(
                position.getX(a),
                position.getY(a),
                position.getZ(a),
              )),
              markT(new AmmoLib.btVector3(
                position.getX(b),
                position.getY(b),
                position.getZ(b),
              )),
              markT(new AmmoLib.btVector3(
                position.getX(c),
                position.getY(c),
                position.getZ(c),
              ))
            );
          }
    
        }

        const groundShape=markP(new AmmoLib.btBvhTriangleMeshShape(triangleMesh,true,true));
        const groundTransform = markT(new AmmoLib.btTransform());
        groundTransform.setIdentity();
        groundTransform.setOrigin(markT(ammoAndThreeConverter.convertVector3ThreeToAmmo(mesh.position)));
        groundTransform.setRotation(markT(ammoAndThreeConverter.convertQuaternionThreeToAmmo(mesh.quaternion)));
    
        const mass = 0;
        const localInertia = markT(new AmmoLib.btVector3(0, 0, 0));
        const myMotionState = markP(new AmmoLib.btDefaultMotionState(groundTransform));
        const rbInfo = markT(new AmmoLib.btRigidBodyConstructionInfo(mass, myMotionState, groundShape, localInertia));
        const body = markP(new AmmoLib.btRigidBody(rbInfo));
        dynamicsWorld.addRigidBody(body);
        bodies.push(body);
  
      }
    });



    this.ammo={
      ammoObjectSweeper,
      markT,
      markP,
      ammoAndThreeConverter,
      dynamicsWorld,
      bodies,
    };
  }
  async destroyAmmoAsync(){
    const {ammoObjectSweeper}=this.ammo;
    ammoObjectSweeper.destroyPermanentObjects();

  }
  setupEvents() {
    const { stats } = this;


    window.addEventListener("resize", this.getBind("onResize"));

    document.addEventListener("keydown",this.getBind("onKeydown"))
    document.addEventListener("keyup",this.getBind("onKeyup"))


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

    document.removeEventListener("keydown",this.getBind("onKeydown"))
    document.removeEventListener("keyup",this.getBind("onKeyup"))

  }

  async onClickJoinAsync(){
    const {AmmoLib,SkeletonUtils}=this.dynamicImports;
    const {localVideo}=this;
    const {scene,originalHanpenGltf}=this.three;
    const {
      markT,
      markP,
      dynamicsWorld,
      bodies,
      ammoAndThreeConverter,
    }=this.ammo;

    const {socket}=this;
    const {
      wasSucceeded,
      playerRotation,
    }=await new Promise((resolve)=>{
      socket.emit(EVENT_JOIN,{
        room:ROOM_MAIN,
      },({wasSucceeded,playerRotation})=>{
        console.log("EVENT_JOIN result",wasSucceeded,playerRotation);
        this.setJoined(wasSucceeded);
        resolve({wasSucceeded,playerRotation});
      });
    });
    if(!wasSucceeded){
      return;
    }


    const hanpenGltf={
      animations:originalHanpenGltf.animations,
      scene:SkeletonUtils.clone(originalHanpenGltf.scene),
    };
    const myPlayer=new MyPlayer(hanpenGltf,playerRotation);
    scene.add(myPlayer);
    myPlayer.setVideo(localVideo);

    
    const capsuleShape = markP(new AmmoLib.btCapsuleShape(1/2,CAPSULE_HEIGHT/2));
    const startTransform = markT(new AmmoLib.btTransform());
    startTransform.setIdentity();
    startTransform.setOrigin(markT(ammoAndThreeConverter.convertVector3ThreeToAmmo(myPlayer.position)));
    const mass = 1;
    const localInertia = markT(new AmmoLib.btVector3(0, 0, 0));
    capsuleShape.calculateLocalInertia(mass, localInertia);

    const myMotionState = markP(new AmmoLib.btDefaultMotionState(startTransform));
    const rbInfo = markT(new AmmoLib.btRigidBodyConstructionInfo(mass, myMotionState, capsuleShape, localInertia));
    const capsuleBody = markP(new AmmoLib.btRigidBody(rbInfo));
    capsuleBody.setAngularFactor(markT(new AmmoLib.btVector3(0,0,0)));
    capsuleBody.setActivationState(DISABLE_DEACTIVATION);
    dynamicsWorld.addRigidBody(capsuleBody);
    bodies.push(capsuleBody);

    Object.assign(myPlayer.userData,{
      capsuleBody,
    });

    Object.assign(this.three,{
      myPlayer,
    });



  }
  update(){
    const {myPlayer,theirPlayerList,packetThreeConverter,camera}=this.three;
    const {socket,buttonStateMap}=this;
    const {AmmoLib}=this.dynamicImports;
    const {
      ammoObjectSweeper,
      markT,
      markP,
      ammoAndThreeConverter,
      dynamicsWorld,
    }=this.ammo;


    for(let [name,buttonState] of buttonStateMap){
      buttonState.update();
      if(buttonState.isOnDown()){
        console.log("isOnDown",name);
      }
      if(buttonState.isOnUp()){
        console.log("isOnUp",name);
      }
    }

    //物理シミュレーション前
    if(myPlayer){
      const {cameraBase,capsuleBody}=myPlayer.userData;
      const isSomeDown=(nameList)=>{
        return nameList.map((name)=>buttonStateMap.get(name).currentPressState).some((currentPressState)=>currentPressState);
      }
      const fTotal=new THREE.Vector3();
      if(isSomeDown([KEY_CODE_KEY_W,BUTTON_NAME_MOVE_FORWARD])){
        const f=new THREE.Vector3(0,0,-1).applyQuaternion(myPlayer.quaternion).multiplyScalar(10);
        fTotal.add(f);
      }
      if(isSomeDown([KEY_CODE_KEY_A,BUTTON_NAME_MOVE_LEFT])){
        const f=new THREE.Vector3(-1,0,0).applyQuaternion(myPlayer.quaternion).multiplyScalar(10);
        fTotal.add(f);
      }
      if(isSomeDown([KEY_CODE_KEY_S,BUTTON_NAME_MOVE_BACKWARD])){
        const f=new THREE.Vector3(0,0,1).applyQuaternion(myPlayer.quaternion).multiplyScalar(10);
        fTotal.add(f);
      }
      if(isSomeDown([KEY_CODE_KEY_D,BUTTON_NAME_MOVE_RIGHT])){
        const f=new THREE.Vector3(1,0,0).applyQuaternion(myPlayer.quaternion).multiplyScalar(10);
        fTotal.add(f);
      }
      if(isSomeDown([KEY_CODE_ARROW_UP,BUTTON_NAME_CAMERA_UP])){
        cameraBase.rotation.x+=0.1;
      }
      if(isSomeDown([KEY_CODE_ARROW_LEFT,BUTTON_NAME_CAMERA_LEFT])){
        myPlayer.rotation.y+=0.1;
      }
      if(isSomeDown([KEY_CODE_ARROW_DOWN,BUTTON_NAME_CAMERA_DOWN])){
        cameraBase.rotation.x-=0.1;
      }
      if(isSomeDown([KEY_CODE_ARROW_RIGHT,BUTTON_NAME_CAMERA_RIGHT])){
        myPlayer.rotation.y-=0.1;
      }
      if(0<fTotal.lengthSq()){
        capsuleBody.applyCentralForce(markT(ammoAndThreeConverter.convertVector3ThreeToAmmo(fTotal)));
        myPlayer.setRunningWeight(1);
      }else{
        myPlayer.setRunningWeight(0);
      }


      myPlayer.update(1/FPS_CLIENT);


    }
    for(let theirPlayer of theirPlayerList){
      theirPlayer.update(1/FPS_CLIENT);
    }
    
    const delta=1/FPS_CLIENT;
    dynamicsWorld.stepSimulation(delta, 2);

    ammoObjectSweeper.destroyTemporaryObjects();
    

    //物理シミュレーション後
    if(myPlayer){
      const {cameraTarget,capsuleBody}=myPlayer.userData;

      const origin=capsuleBody.getWorldTransform().getOrigin();
      myPlayer.position.set(
        origin.x(),
        origin.y()-CAPSULE_HEIGHT/2,
        origin.z()
      );

      //回転は物理演算を使わない
      // const rotation=capsuleBody.getWorldTransform().getRotation();
      // myPlayer.quaternion.set(
      //   rotation.x(),
      //   rotation.y(),
      //   rotation.z(),
      //   rotation.w()
      // );

      cameraTarget.updateWorldMatrix(true,false);
      // なめらかなカメラ追従の仕組みは余裕があれば組み込む
      if(!IS_DEBUG_CAMERA){
        cameraTarget.matrixWorld.decompose(
          camera.position,
          camera.quaternion,
          camera.scale
        );
      }
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
        runningWeight:myPlayer.getRunningWeight(),
        playerRotation:myPlayer.getPlayerRotation(),
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
    const {theirPlayerList,scene,originalHanpenGltf}=this.three;
    const {SkeletonUtils}=this.dynamicImports;

    const hanpenGltf={
      animations:originalHanpenGltf.animations,
      scene:SkeletonUtils.clone(originalHanpenGltf.scene),
    };

    const theirPlayer=new TheirPlayer(hanpenGltf,peerId);
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
  async onTheirMoveAsync({peerId,transform,runningWeight,playerRotation}){
    // console.log("MainClientApp#onTheirMoveAsync",peerId);
    // console.log(peerId,JSON.stringify(transform));
    const {theirPlayerList,packetThreeConverter}=this.three;

    const theirPlayer=theirPlayerList.find((theirPlayer)=>theirPlayer.peerId==peerId);
    if(theirPlayer){
      packetThreeConverter.convertVector3PacketToThree(transform.position,theirPlayer.position);
      packetThreeConverter.convertQuaternionPacketToThree(transform.quaternion,theirPlayer.quaternion);
      theirPlayer.setRunningWeight(runningWeight);
      theirPlayer.setPlayerRotation(playerRotation);

    }
  }
  async onPopulationAsync(populations){
    console.log("MainClientApp#onPopulationAsync",populations);
    this.setPopulations(populations);
  }

  onButtonDown(name){
    console.log("MainClientApp#onButtonDown",name);
    const buttonState=this.buttonStateMap.get(name);
    if(buttonState){
      buttonState.setNewPressState(true);
    }
  }
  onButtonUp(name){
    console.log("MainClientApp#onButtonUp",name);
    const buttonState=this.buttonStateMap.get(name);
    if(buttonState){
      buttonState.setNewPressState(false);
    }
  }
  onKeydown(event){
    console.log("MainClientApp#onKeydown",event);
    const {code}=event;
    const buttonState=this.buttonStateMap.get(code);
    if(buttonState){
      buttonState.setNewPressState(true);
    }
  }
  onKeyup(event){
    console.log("MainClientApp#onKeyup",event);
    const {code}=event;
    const buttonState=this.buttonStateMap.get(code);
    if(buttonState){
      buttonState.setNewPressState(false);
    }
  }


}