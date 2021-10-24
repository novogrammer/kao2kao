import { EVENT_JOIN, FPS_CLIENT, IS_DEBUG, ROOM_MAIN, ROOM_WAITING } from "../common/constants";
import BaseClientApp from "./BaseClientApp";
import Stats from "stats.js";
import * as animate from 'animate';
import * as THREE from "three";

// import { GPUStatsPanel } from 'three/examples/jsm/utils/GPUStatsPanel.js'


export default class MainClientApp extends BaseClientApp{
  constructor({localVideo,iceServers,view}){
    super({localVideo,iceServers,room:ROOM_WAITING,view});
  }
  /**
   * @override
   */
   async setupAsync(){
    const { GPUStatsPanel }=await import('three/examples/jsm/utils/GPUStatsPanel.js');
    this.dynamicImports={
      GPUStatsPanel,
    };


    this.setupStats();
    await super.setupAsync();
    await this.setupThreeAsync();
    this.setupEvents();
  }
  /**
   * @override
   */
   async destroyAsync(){
    this.destroyEvents();
    await this.setupThreeAsync();
    await super.destroyAsync();
    this.destroyStats();
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
    const renderer = new THREE.WebGLRenderer( {
      antialias: true,
      canvas:view,
    } );
    renderer.setPixelRatio( window.devicePixelRatio );
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


    const capsule = new THREE.Mesh(
      // new RoundedBoxGeometry(),
      new THREE.CylinderGeometry(0.5,0.5,2,32),
      new THREE.MeshStandardMaterial({
        envMap:textureCube,
        color: 0x00ff00,
        roughness:0.2,
        metalness:1,
      })
      // new THREE.MeshPhysicalMaterial({
      //   color: 0xffffff,
      //   envMap:textureCube,
      //   roughness:0,
      //   metalness:0,
      //   clearcoat: 0.5,
      //   clearcoatRoughness: 0.1,
      //   transmission:0.5,
      //   side: THREE.DoubleSide,
      //   transparent: true,
      // })
    );
    capsule.position.y=2;
    capsule.castShadow=true;
    capsule.receiveShadow=true;

    scene.add( capsule );
    
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
      renderer,
      gpuPanel,
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
    const {socket}=this;
    socket.emit(EVENT_JOIN,{
      room:ROOM_MAIN,
    },(wasSucceeded)=>{
      console.log(wasSucceeded);
    });

  }
  update(){

  }
  render(){
    const {
      renderer,
      scene,
      camera,
    } = this.three;
    renderer.render(scene, camera);

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
}