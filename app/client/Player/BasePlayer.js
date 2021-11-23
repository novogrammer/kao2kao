import * as THREE from "three";
import { ACTION_WEIGHT_VELOCITY, FPS_MESSAGE, PLAYER_CAMERA_Z } from "../../common/constants";

export default class BasePlayer extends THREE.Group{
  constructor(hanpenGltf,playerRotation=null){
    super();
    Object.assign(this.userData,{
      hanpenGltf,
      playerRotation,
      velocity:null,
      velocityRemainTime:0,
    });
    this.setupScene();
  }
  setupScene(){
    const {hanpenGltf,playerRotation}=this.userData;
    this.rotation.order="YXZ";
    const material=new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side:THREE.DoubleSide,
    });

    if(playerRotation!=null){
      const v=new THREE.Vector3(0,5,3);
      v.applyAxisAngle(new THREE.Vector3(0,1,0),playerRotation);
      this.position.copy(v);
      this.rotation.y=playerRotation;

    }


    const cameraBase=new THREE.Object3D();
    cameraBase.position.y=1.6;
    cameraBase.position.z=-0.3;
    this.add(cameraBase);
    const cameraTarget=new THREE.Object3D();
    cameraTarget.position.y=1.0;
    cameraTarget.position.z=PLAYER_CAMERA_Z;
    cameraBase.add(cameraTarget);

    
    // const hanpen= hanpenGltf.scene.clone();
    const hanpen= hanpenGltf.scene;
    hanpen.traverse((object)=>{
      if ( object.isMesh ){
        object.castShadow = true;
        object.receiveShadow = true;
        object.frustumCulled=false;
        Object.assign(object.userData,{
          canChangeColor:true,
        });
        object.material=object.material.clone();
        
        const {material}=object;
        if(playerRotation!=null){
          const color=this.makeColor();
          material.color.copy(color);
        }else{
          material.color.set(0xffffff);
        }
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
    videoPlane.position.y=0.1;
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
    const {mixer,actionMap,runningWeight,velocity}=this.userData;
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
    if(0<this.userData.velocityRemainTime){
      this.userData.velocityRemainTime-=deltaTime;
      if(velocity!=null){
        const dp=velocity.clone().multiplyScalar(deltaTime);
        this.position.add(dp);
      }
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
  makeColor(){
    const {playerRotation}=this.userData;
    const color=new THREE.Color().setHSL(playerRotation/(Math.PI*2),1,0.5);
    return color;
  }
  getPlayerRotation(){
    return this.userData.playerRotation;
  }
  setPlayerRotation(playerRotation){
    Object.assign(this.userData,{
      playerRotation,
    });
    const {hanpen}=this.userData;
    const color=this.makeColor();
    hanpen.traverse((object)=>{
      if ( object.isMesh && object.userData.canChangeColor){
        const {material}=object;
        material.color.copy(color);
      }
    });
  }
  setTargetPosition(targetPosition){
    const velocityRemainTime=1/FPS_MESSAGE;
    const velocity=targetPosition.clone().sub(this.position).multiplyScalar(1/velocityRemainTime);
    Object.assign(this.userData,{
      velocity,
      velocityRemainTime,
    });
    
  }
}