

export default class PacketThreeConverter{
  constructor({THREE}){
    Object.assign(this,{
      THREE,
    });
  }
  convertVector3PacketToThree(packetVector3,threeVector3=null) {
    const {THREE}=this;
    threeVector3=threeVector3||new THREE.Vector3();
    threeVector3.fromArray(packetVector3);
    return threeVector3;
  }
  convertVector3ThreeToPacket(threeVector3,packetVector3=null){
    packetVector3=packetVector3||[0,0,0];
    threeVector3.toArray(packetVector3);
    return packetVector3;
  }
  
  convertQuaternionPacketToThree(packetQuaternion,threeQuaternion=null){
    const {THREE}=this;
    threeQuaternion=threeQuaternion||new THREE.Quaternion();
    threeQuaternion.fromArray(packetQuaternion);
    return threeQuaternion;
  }
  
  convertQuaternionThreeToPacket(threeQuaternion,packetQuaternion=null){
    packetQuaternion=packetQuaternion||[0,0,0,0];
    threeQuaternion.toArray(packetQuaternion);
    return packetQuaternion;
  }
}