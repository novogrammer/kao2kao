import BasePlayer from "./BasePlayer";


export default class TheirPlayer extends BasePlayer{
  constructor(peerId){
    super();
    this.peerId=peerId;
  }
}