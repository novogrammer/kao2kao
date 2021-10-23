import { EVENT_JOIN, FPS_CLIENT, IS_DEBUG, ROOM_MAIN, ROOM_WAITING } from "../common/constants";
import BaseClientApp from "./BaseClientApp";
import Stats from "stats.js";
import * as animate from 'animate';

export default class MainClientApp extends BaseClientApp{
  constructor({localVideo,iceServers}){
    super({localVideo,iceServers,room:ROOM_WAITING});
  }
  /**
   * @override
   */
   async setupAsync(){
     this.setupStats();
    await super.setupAsync();
    this.setupEvents();
  }
  /**
   * @override
   */
   async destroyAsync(){
    this.destroyEvents();
    await super.destroyAsync();
    this.destroyStats();
  }
  setupStats() {
    const stats = new Stats();
    // stats.dom.id="Stats";
    stats.dom.style.left = "auto";
    stats.dom.style.right = "0";
    document.body.appendChild(stats.dom);
    if (!IS_DEBUG) {
      stats.dom.style.display = "none";
    }
    this.stats = stats;
  }
  destroyStats() {
    const { stats } = this;
    stats.dom.remove();
  }
  setupEvents() {
    const { stats } = this;


    window.addEventListener("resize", this.getBind("onResize"));


    const onTickAsyncInternal = async () => {
      stats.begin();
      await this.onTickAsync();
      stats.end();
    };

    let animationState = "ready";
    this.animation = animate(async () => {
      if (animationState != "ready") {
        // console.log("skip frame");
        return;
      }
      animationState = "executing";
      //async call
      let promise = onTickAsyncInternal();
      promise.then(() => {
        animationState = "ready";
      });
    }, FPS_CLIENT);

  }
  destroyEvents() {
    this.animation.pause();
    window.removeEventListener("resize", this.getBind("onResize"));
  }

  onClickJoin(){
    const {socket}=this;
    socket.emit(EVENT_JOIN,{
      room:ROOM_MAIN,
    },(wasSucceeded)=>{
      console.log(wasSucceeded);
    });

  }
  async onTickAsync() {
  }

  onResize(){

  }
}