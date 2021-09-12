const express = require('express');
const next = require('next');
const http = require('http');
const socketIo=require('socket.io');

const port = 3000;
const dev = process.env.NODE_ENV !== 'production';



async function main(){
  const expressApp = express();
  const server=http.createServer(expressApp);
  {
    const io = socketIo(server);
    io.on('connect', (socket)=>{
      console.log("onconnect");

    });
  }
  {
    const nextApp = next({ dev });
    const nextHandler = nextApp.getRequestHandler();
    await nextApp.prepare();
    
    expressApp.all('*', (req, res) => {
      return nextHandler(req, res);
    });
  }
  
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
  
}

main();
