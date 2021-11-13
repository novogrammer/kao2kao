import BasePlayer from "./BasePlayer";


export default class TheirPlayer extends BasePlayer{
  constructor(hanpenGltf,peerId){
    super(hanpenGltf);
    this.peerId=peerId;
  }
}