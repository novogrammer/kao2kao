
export default class AmmoAndThreeConverter{
  constructor({THREE,AmmoLib}){
    Object.assign(this,{
      THREE,
      AmmoLib,
    });
  }
  convertVector3AmmoToThree(ammoVector3,threeVector3=null) {
    const {THREE}=this;
    threeVector3=threeVector3||new THREE.Vector3();
    threeVector3.set(
      ammoVector3.x(),
      ammoVector3.y(),
      ammoVector3.z()
    );
    return threeVector3;
  }
  
  convertVector3ThreeToAmmo(threeVector3,ammoVector3=null){
    const {AmmoLib}=this;
    ammoVector3=ammoVector3||new AmmoLib.btVector3();
    ammoVector3.setValue(
      threeVector3.x,
      threeVector3.y,
      threeVector3.z
    );
    return ammoVector3;
  }
  
  convertQuaternionAmmoToThree(ammoQuaternion,threeQuaternion=null){
    const {THREE}=this;
    threeQuaternion=threeQuaternion||new THREE.Quaternion();
    threeQuaternion.set(
      ammoQuaternion.x(),
      ammoQuaternion.y(),
      ammoQuaternion.z(),
      ammoQuaternion.w()
    );
    return threeQuaternion;
  }
  
  convertQuaternionThreeToAmmo(threeQuaternion,ammoQuaternion=null){
    const {AmmoLib}=this;
    ammoQuaternion=ammoQuaternion||new AmmoLib.btQuaternion();
    ammoQuaternion.setValue(
      threeQuaternion.x,
      threeQuaternion.y,
      threeQuaternion.z,
      threeQuaternion.w
    );
    return ammoQuaternion;
  }
}


