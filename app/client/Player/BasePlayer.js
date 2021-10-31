import * as THREE from "three";

export default class BasePlayer extends THREE.Group{
  constructor(){
    super();
    this.setupScene();
  }
  setupScene(){
    const material=new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness:0.2,
      metalness:1,
    });
    const capsule = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5,0.5,2,32),
      material
    );
    capsule.position.y=2;
    capsule.castShadow=true;
    capsule.receiveShadow=true;

    this.add( capsule );

    Object.assign(this.userData,{
      material,
      capsule,
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
}