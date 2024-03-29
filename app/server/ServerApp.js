
import express from "express";
import * as http from "http";
import socketIo from "socket.io";
import next from "next";
import * as THREE from "three";

import { EVENT_ADD_PEER, EVENT_JOIN, EVENT_MY_MOVE, EVENT_NEED_TO_CONNECT, EVENT_NEED_TO_DISCONNECT, EVENT_POPULATION, EVENT_REMOVE_PEER, EVENT_SIGNALING, EVENT_THEIR_MOVE, FPS_SERVER, MAIN_ROOM_CAPACITY, PLAYER_ROTATION_OFFSET, ROOM_MAIN, ROOM_SIMPLE, ROOM_WAITING } from "../common/constants";

const port = 3000;
const dev = process.env.NODE_ENV !== 'production';



export default class ServerApp{
  constructor(){
    this.setupPromise = this.setupAsync();
    this.playerIndex=0;
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

    socket.on("disconnect", (reason) => {
      console.log("disconnect reason:" + reason);

      socket.to(room).emit(EVENT_NEED_TO_DISCONNECT,{
        peerId:socket.id,
      });
    });


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

    socket.on("disconnect", async(reason) => {
      await this.emitPopulationAsync(socket);
    });


    socket.on(EVENT_JOIN,async (data,callback)=>{
      console.log(EVENT_JOIN,data);
      const {room}=data;
      switch(room){
        case ROOM_MAIN:
          try{
            await this.setupMainRoomAsync(socket);
            const playerRotation=(this.playerIndex*PLAYER_ROTATION_OFFSET)%(Math.PI*2);
            this.playerIndex+=1;
            callback({
              wasSucceeded:true,
              playerRotation,
            });
          }catch(error){
            console.log(`join failed: ${error?.message}`);
            callback({wasSucceeded:false});
          }
          break;
        default:
          console.log(`unknown room from waiting: ${room}`);
          callback({wasSucceeded:false});
          break;
      }
    });
    await this.emitPopulationAsync(socket);
  }
  async setupMainRoomAsync(socket){
    console.log("ServerApp#setupMainRoomAsync");
    const {io} = this;
    const previousRoom=ROOM_WAITING;
    const room=ROOM_MAIN;
    const mainRoomIds=Array.from(await io.in(ROOM_MAIN).allSockets());
    if(mainRoomIds.includes(socket.id)){
      throw new Error("already joined");
    }
    if(MAIN_ROOM_CAPACITY<=mainRoomIds.length){
      throw new Error("over MAIN_ROOM_CAPACITY");
    }
    socket.join(room);
    socket.leave(previousRoom);

    socket.on("disconnect", (reason) => {
      console.log("disconnect reason:" + reason);
      socket.to(room).emit(EVENT_REMOVE_PEER,{
        peerId:socket.id,
      });

      socket.to(room).emit(EVENT_NEED_TO_DISCONNECT,{
        peerId:socket.id,
      });
    });


    socket.on(EVENT_SIGNALING,(data)=>{
      data.from=socket.id;
      console.log(`${EVENT_SIGNALING} ${data.type} [${data.from} -> ${data.to}]`);
      const target=data.to;
      if(target){
        socket.to(target).emit(EVENT_SIGNALING,data);
      }
    });

    socket.on(EVENT_MY_MOVE,(myData)=>{
      const theirData=Object.assign({
        peerId:socket.id,
      },myData);
      socket.to(room).emit(EVENT_THEIR_MOVE,theirData);
   });

    const ids = Array.from(await io.in(room).allSockets());
    for(let id of ids){
      if(socket.id!=id){
        // 新しく来た人へ既にいる人を教える
        socket.emit(EVENT_ADD_PEER,{
            peerId:id,
          });
      }else{
        // 既にいる人へ新しく来た人を教える
        socket.to(room).emit(EVENT_ADD_PEER,{
          peerId:id,
        });
      }
    }
    for(let id of ids){
      if(socket.id!=id){
        // 新しく来た人が既にいる人につなぐ
        socket.emit(EVENT_NEED_TO_CONNECT,{
          peerId:id,
        });
      }
    }
    await this.emitPopulationAsync(socket);

  }
  async emitPopulationAsync(socket){
    const {io} = this;

    const populations={
      [ROOM_WAITING]:Array.from(await io.in(ROOM_WAITING).allSockets()).length,
      [ROOM_MAIN]:Array.from(await io.in(ROOM_MAIN).allSockets()).length,
    };

    socket.to(ROOM_WAITING).emit(EVENT_POPULATION,populations);
    socket.emit(EVENT_POPULATION,populations);

    
  }
  async onConnectAsync(socket) {
    console.log("ServerApp#onConnectAsync");
    const { handshake } = socket;
    const { room } = handshake.query;

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