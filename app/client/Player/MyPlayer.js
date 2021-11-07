import BasePlayer from "./BasePlayer";
import * as THREE from "three";


export default class MyPlayer extends BasePlayer{
  constructor(){
    super();
    const cameraBase=new THREE.Object3D();
    cameraBase.position.y=2;
    this.add(cameraBase);
    const cameraTarget=new THREE.Object3D();
    cameraTarget.position.z=3;
    cameraBase.add(cameraTarget);
    Object.assign(this.userData,{
      cameraBase,
      cameraTarget,
    });
  }


}