import { EVENT_JOIN, ROOM_MAIN, ROOM_WAITING } from "../common/constants";
import BaseClientApp from "./BaseClientApp";

export default class MainClientApp extends BaseClientApp{
  constructor({localVideo,iceServers}){
    super({localVideo,iceServers,room:ROOM_WAITING});
  }
  onClickJoin(){
    const {socket}=this;
    socket.emit(EVENT_JOIN,{
      room:ROOM_MAIN,
    },(wasSucceeded)=>{
      console.log(wasSucceeded);
    });

  }
}