import { ROOM_SIMPLE } from "../common/constants";
import BaseClientApp from "./BaseClientApp";

export default class SimpleClientApp extends BaseClientApp{
  constructor({localVideo,setRemoteList,iceServers}){
    super({localVideo,setRemoteList,iceServers,room:ROOM_SIMPLE});
  }
}