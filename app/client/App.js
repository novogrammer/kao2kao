import io from 'socket.io-client';

export default class App{
  constructor(){
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
    const options={};
    this.socket=io(options);
    const {socket}=this;

    socket.on("connect",this.getBind("onConnect"));
    socket.on("disconnect",this.getBind("onDisconnect"));

    
  }
  async destroyAsync(){
    const {socket}=this;
    socket.off("connect",this.getBind("onConnect"));
    socket.off("disconnect",this.getBind("onDisconnect"));
    socket.close();
  }
  onConnect() {
    console.log("App#onConnect");
  }
  onDisconnect() {
    console.log("App#onDisconnect");
    //DO NOTHING
  }
}