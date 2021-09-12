
import express from "express";
import * as http from "http";
import socketIo from "socket.io";
import next from "next";
import { FPS_SERVER } from "../common/constants";

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

    io.on('connect', this.onConnect.bind(this));
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
  onConnect(socket) {
    console.log("ServerApp#onConnect");
    const { handshake } = socket;
    // const { room } = handshake.query;

    socket.on("disconnect", (reason) => {
      console.log("disconnect reason:" + reason);
    });

  }
  onTick(){

  }

}