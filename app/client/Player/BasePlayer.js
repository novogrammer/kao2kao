import * as THREE from "three";

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
            action.setEffectiveWeight(clip.name=="Idle"?0:1);
            action.play();
            actionMap.set(clip.name,action);
          }
          break;
        default:
          // DO NOTHING
          break;
      }
    }

    // const capsule = new THREE.Mesh(
    //   new THREE.CylinderGeometry(0.5,0.5,2,32),
    //   material
    // );
    // capsule.position.y=1;
    // capsule.castShadow=true;
    // capsule.receiveShadow=true;

    // this.add( capsule );

    Object.assign(this.userData,{
      material,
      cameraBase,
      cameraTarget,
      hanpen,
      skeleton,
      mixer,
    });
    

  }
  setVideo(video){
    const {material}=this.userData;
    if(video){
      const videoTexture=new THREE.VideoTexture(video);
      material.map=videoTexture;
      material.needsUpdate=true;
    }else{
      material.map=null;
      material.needsUpdate=true;
    }
  }
  update(deltaTime){
    const {mixer}=this.userData;

    mixer.update(deltaTime);
  }
}