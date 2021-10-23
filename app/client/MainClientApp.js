import { ROOM_WAITING } from "../common/constants";
import BaseClientApp from "./BaseClientApp";

export default class MainClientApp extends BaseClientApp{
  constructor({localVideo,iceServers}){
    super({localVideo,iceServers,room:ROOM_WAITING});
  }
}