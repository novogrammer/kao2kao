
import express from "express";
import * as http from "http";
import socketIo from "socket.io";
import next from "next";
import { EVENT_JOIN, EVENT_NEED_TO_CONNECT, EVENT_NEED_TO_DISCONNECT, EVENT_SIGNALING, FPS_SERVER, ROOM_MAIN, ROOM_SIMPLE, ROOM_WAITING } from "../common/constants";

const port = 3000;
const dev = process.env.NODE_ENV !== 'production';



export default class ServerApp{
  constructor(){
    this.setupPromise = this.setupAsync();

  }
  async setupAsync() {
    const app = express();
    this.app = app;
    const server = http.createServer(app);
    this.server = server;

    this.setupSocketIo();
    await this.setupNextAsync();

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    });

    setInterval(() => {
      this.onTick();
    }, 1000 / FPS_SERVER);
  }
  setupSocketIo() {
    const { server } = this;
    const io = socketIo(server);
    this.io = io;

    io.on('connect', this.onConnectAsync.bind(this));
  }
  async setupNextAsync() {
    const { app } = this;
    const nextApp = next({ dev });
    const nextHandler = nextApp.getRequestHandler()
    await nextApp.prepare();
    app.get('*', (req, res) => {
      return nextHandler(req, res);
    });

  }
  async setupSimpleRoomAsync(socket){
    console.log("ServerApp#setupSimpleRoomAsync");
    const {io} = this;
    const room=ROOM_SIMPLE;

    socket.join(room);

    socket.on(EVENT_SIGNALING,(data)=>{
      data.from=socket.id;
      console.log(`${EVENT_SIGNALING} ${data.type} [${data.from} -> ${data.to}]`);
      const target=data.to;
      if(target){
        socket.to(target).emit(EVENT_SIGNALING,data);
      }
    });

    const ids = Array.from(await io.in(room).allSockets());

    for(let id of ids){
      if(socket.id!=id){
        socket.emit(EVENT_NEED_TO_CONNECT,{
          peerId:id,
        });
      }
    }

  }
  async setupWaitingRoomAsync(socket){
    console.log("ServerApp#setupWaitingRoomAsync");
    const {io} = this;

    socket.join(ROOM_WAITING);

    socket.on(EVENT_JOIN,(data,callback)=>{
      console.log(EVENT_JOIN,data);
      const {room}=data;
      switch(room){
        case ROOM_MAIN:
          try{
            this.setupMainRoomAsync(socket)
            callback(true);
          }catch(error){
            callback(false);
          }
          break;
        default:
          console.log(`unknown room from waiting: ${room}`);
          callback(false);
          break;
      }
    });
  }
  async setupMainRoomAsync(socket){
    console.log("ServerApp#setupMainRoomAsync");
    const {io} = this;
    const room=ROOM_MAIN;
    socket.join(room);

    socket.on(EVENT_SIGNALING,(data)=>{
      data.from=socket.id;
      console.log(`${EVENT_SIGNALING} ${data.type} [${data.from} -> ${data.to}]`);
      const target=data.to;
      if(target){
        socket.to(target).emit(EVENT_SIGNALING,data);
      }
    });

    const ids = Array.from(await io.in(room).allSockets());

    for(let id of ids){
      if(socket.id!=id){
        socket.emit(EVENT_NEED_TO_CONNECT,{
          peerId:id,
        });
      }
    }

  }
  async onConnectAsync(socket) {
    console.log("ServerApp#onConnectAsync");
    const { handshake } = socket;
    const { room } = handshake.query;

    socket.on("disconnect", (reason) => {
      console.log("disconnect reason:" + reason);
      socket.broadcast.emit(EVENT_NEED_TO_DISCONNECT,{
        peerId:socket.id,
      });
    });

    switch(room){
      case ROOM_SIMPLE:
        await this.setupSimpleRoomAsync(socket);
        break;
      case ROOM_WAITING:
        await this.setupWaitingRoomAsync(socket);
        break;
      default:
        console.log(`unknown room: ${room}`);
        break;
    }


  }
  onTick(){

  }

}