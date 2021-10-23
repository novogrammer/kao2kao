import { ROOM_WAITING } from "../common/constants";
import BaseClientApp from "./BaseClientApp";

export default class MainClientApp extends BaseClientApp{
  constructor({localVideo,setRemoteList,iceServers}){
    super({localVideo,setRemoteList,iceServers,room:ROOM_WAITING});
  }
}