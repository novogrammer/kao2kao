import * as THREE from "three";
import { ACTION_WEIGHT_VELOCITY } from "../../common/constants";

export default class BasePlayer extends THREE.Group{
  constructor(hanpenGltf){
    super();
    Object.assign(this.userData,{
      hanpenGltf,
    });
    this.setupScene();
  }
  setupScene(){
    const {hanpenGltf}=this.userData;
    this.rotation.order="YXZ";
    const material=new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side:THREE.DoubleSide,
    });

    const cameraBase=new THREE.Object3D();
    cameraBase.position.y=2;
    this.add(cameraBase);
    const cameraTarget=new THREE.Object3D();
    cameraTarget.position.y=0.5;
    cameraTarget.position.z=1.5;
    cameraBase.add(cameraTarget);

    
    // const hanpen= hanpenGltf.scene.clone();
    const hanpen= hanpenGltf.scene;
    hanpen.traverse((object)=>{
      if ( object.isMesh ){
        object.castShadow = true;
        object.receiveShadow = true;
        object.frustumCulled=false;
      }
    });
    hanpen.rotation.y=THREE.MathUtils.degToRad(180);
    this.add(hanpen);
    const skeleton = new THREE.SkeletonHelper( hanpen );
    skeleton.visible = false;
    this.add(skeleton);

    const VIDEO_PLANE_SIZE=0.75;
    const videoPlane=new THREE.Mesh(new THREE.PlaneBufferGeometry(VIDEO_PLANE_SIZE,VIDEO_PLANE_SIZE),material);
    videoPlane.rotation.y=THREE.MathUtils.degToRad(180);
    videoPlane.position.y=-0.2;
    videoPlane.position.z=-0.3;
    cameraBase.add(videoPlane);

    const mixer=new THREE.AnimationMixer(hanpen);
    const actionMap=new Map();
    for(let clip of hanpenGltf.animations){
      switch(clip.name){
        case "Idle":
          // FALL THROUGH
        case "Running":
          {
            const action = mixer.clipAction( clip );
            action.enabled=true;
            action.setEffectiveTimeScale(1);
            action.setEffectiveWeight(clip.name=="Idle"?1:0);
            action.play();
            actionMap.set(clip.name,action);
          }
          break;
        default:
          // DO NOTHING
          break;
      }
    }

    const runningWeight=0;

    Object.assign(this.userData,{
      material,
      cameraBase,
      cameraTarget,
      hanpen,
      skeleton,
      mixer,
      actionMap,
      runningWeight,
    });
    

  }
  setVideo(video){
    const {material}=this.userData;
    if(video){
      const videoTexture=new THREE.VideoTexture(video);
      videoTexture.encoding=THREE.sRGBEncoding;
      material.map=videoTexture;
      material.needsUpdate=true;
    }else{
      material.map=null;
      material.needsUpdate=true;
    }
  }
  update(deltaTime){
    const {mixer,actionMap,runningWeight}=this.userData;
    const idleAction=actionMap.get("Idle");
    const runningAction=actionMap.get("Running");
    let currentRunningWeight=runningAction.getEffectiveWeight();
    const deltaWeight=ACTION_WEIGHT_VELOCITY*deltaTime;
    if(Math.abs(runningWeight-currentRunningWeight)<=deltaWeight){
      currentRunningWeight=runningWeight;
    }else{
      const direction=Math.sign(runningWeight-currentRunningWeight);
      currentRunningWeight+=direction*deltaWeight;
    }
    // console.log(runningWeight,currentRunningWeight);
    idleAction.setEffectiveWeight(1-currentRunningWeight);
    runningAction.setEffectiveWeight(currentRunningWeight);
    mixer.update(deltaTime);
  }
  getRunningWeight(){
    return this.userData.runningWeight;
  }
  setRunningWeight(runningWeight){
    this.userData.runningWeight=runningWeight;
  }
}