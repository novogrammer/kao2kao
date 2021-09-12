import io from 'socket.io-client';
import { VIDEO_SIZE } from '../common/constants';

export default class ClientApp{
  constructor({video}){
    Object.assign(this,{
      video,
    })
    this.binds = {};
    this.setupPromise = this.setupAsync();
  }
  getBind(methodName) {
    let bind = this.binds[methodName];
    if (!bind) {
      bind = this[methodName].bind(this);
      this.binds[methodName] = bind;
    }
    return bind;
  }
  async setupAsync(){
    await this.setupCameraAsync();
    this.setupSocketIo();
  }
  async destroyAsync(){
    this.destroySocketIo();
    await this.destroyCameraAsync();
  }
  setupSocketIo(){
    const options={};
    this.socket=io(options);
    const {socket}=this;

    socket.on("connect",this.getBind("onConnect"));
    socket.on("disconnect",this.getBind("onDisconnect"));
  }
  destroySocketIo(){
    const {socket}=this;
    socket.off("connect",this.getBind("onConnect"));
    socket.off("disconnect",this.getBind("onDisconnect"));
    socket.close();
  }

  async setupCameraAsync() {
    const { video } = this;
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: VIDEO_SIZE,
        height: VIDEO_SIZE
      },
    });
    video.srcObject = stream;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve();
      };
    });
    video.play();


    Object.assign(this, {
      stream,
    });
  }
  async destroyCameraAsync() {
    const { stream } = this;
    const tracks = stream.getTracks();
    for (const track of tracks) {
      track.stop();
    }

  }
  onConnect() {
    console.log("ClientApp#onConnect");
  }
  onDisconnect() {
    console.log("ClientApp#onDisconnect");
    //DO NOTHING
  }
}