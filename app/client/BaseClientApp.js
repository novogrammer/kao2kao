import io from 'socket.io-client';
import { EVENT_NEED_TO_CONNECT, EVENT_NEED_TO_DISCONNECT, EVENT_SIGNALING,  FPS_VIDEO,  VIDEO_SIZE } from '../common/constants';


export default class BaseClientApp{
  constructor({localVideo,setRemoteList=()=>{},iceServers,room}){
    Object.assign(this,{
      localVideo,
      setRemoteList,
      iceServers,
      room,
    })
    this.remoteList=[];
    this.bindMap = new Map();
    this.peerConnectionMap = new Map();
    this.setupPromise = this.setupAsync();
  }
  getBind(methodName) {
    let bind = this.bindMap.get(methodName);
    if (!bind) {
      bind = this[methodName].bind(this);
      this.bindMap.set(methodName,bind);
    }
    return bind;
  }
  async setupAsync(){
    await this.setupCameraAsync();
    this.setupSocketIo();
  }
  async destroyAsync(){
    this.destroySocketIo();
    await this.destroyCameraAsync();
  }
  setupSocketIo(){
    const options={
      query:{
        room:this.room,
      },
    };
    this.socket=io(options);
    const {socket}=this;

    socket.on("connect",this.getBind("onConnect"));

    socket.on(EVENT_NEED_TO_CONNECT,this.getBind("onNeedToConnectAsync"));
    socket.on(EVENT_NEED_TO_DISCONNECT,this.getBind("onNeedToDisconnectAsync"));
    socket.on(EVENT_SIGNALING,this.getBind("onSignalingAsync"));

    socket.on("disconnect",this.getBind("onDisconnect"));
  }
  destroySocketIo(){
    const {socket}=this;
    socket.off("connect",this.getBind("onConnect"));
    socket.off("disconnect",this.getBind("onDisconnect"));
    socket.close();
  }

  async setupCameraAsync() {
    const { localVideo } = this;
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': true,
      'video': {
        facingMode: 'user',
        frameRate: { max: FPS_VIDEO },
        width: VIDEO_SIZE,
        height: VIDEO_SIZE
      },
    });
    localVideo.srcObject = stream;

    await new Promise((resolve) => {
      localVideo.onloadedmetadata = () => {
        resolve();
      };
    });


    Object.assign(this, {
      stream,
    });
  }
  async destroyCameraAsync() {
    const { stream } = this;
    const tracks = stream.getTracks();
    for (const track of tracks) {
      track.stop();
    }

  }
  async destroyPeerConnectionAsync({peerId}){
    const peerConnection=this.peerConnectionMap.get(peerId);
    if(peerConnection){
      console.log(`close connection: ${peerId}`);
      peerConnection.close();
      this.peerConnectionMap.delete(peerId);
    }
    //useStateの都合で新しくArrayを作る必要がある。
    this.remoteList=this.remoteList.filter((remote)=>remote.peerId!=peerId);
    this.setRemoteList(this.remoteList);

  }
  async setupPeerConnectionOfferAsync({peerId}){
    const { socket } = this;

    await this.destroyPeerConnectionAsync({peerId});

    const peerConnection=this.createPeerConnection(peerId);
    this.peerConnectionMap.set(peerId,peerConnection);

    const offer=await peerConnection.createOffer();
    // console.log(offer);
    await peerConnection.setLocalDescription(offer);
    // console.log(peerConnection.localDescription);
    
    socket.emit(EVENT_SIGNALING,{
      type:"offer",
      to:peerId,
      sdp:peerConnection.localDescription,
    });


  }
  async setupPeerConnectionAnswerAsync({peerId,sdp}){
    const { socket } = this;
    await this.destroyPeerConnectionAsync({peerId});

    const peerConnection=this.createPeerConnection(peerId);
    this.peerConnectionMap.set(peerId,peerConnection);

    peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit(EVENT_SIGNALING,{
      type:"answer",
      to:peerId,
      sdp:peerConnection.localDescription,
    });


  }
  createPeerConnection(peerId){
    const {stream, socket,iceServers}=this;
    const peerConnection = new RTCPeerConnection({
      iceServers,
      // iceTransportPolicy:"relay",
    });

    const remote={
      peerId,
      stream:new MediaStream(),
    };
    //useStateの都合で新しくArrayを作る必要がある。
    this.remoteList=this.remoteList.concat([remote]);
    this.setRemoteList(this.remoteList);

    Object.assign(peerConnection,{
      onconnectionstatechange:()=>{
        console.log(`onconnectionstatechange: ${peerConnection.connectionState}`);
      },
      onicecandidate:(event)=>{
        const {candidate}=event;
        console.log(`onicecandidate candidate: ${candidate}`);
        socket.emit(EVENT_SIGNALING,{
          type:"icecandidate",
          to:peerId,
          candidate,
        });
    
      },
      ontrack:(event)=>{
        console.log("ontrack");
        remote.stream.addTrack(event.track);
      },
      onnegotiationneeded:()=>{
        console.log("onnegotiationneeded");
      },
      onremovetrack:(event)=>{
        console.log("onremovetrack");
        remote.stream.removeTrack(event.track);
      },
      oniceconnectionstatechange:()=>{
        console.log(`oniceconnectionstatechange: ${peerConnection.iceConnectionState}`);
      },
      onicegatheringstatechange:()=>{
        console.log(`onicegatheringstatechange: ${peerConnection.iceGatheringState}`);
      },
      onsignalingstatechange:()=>{
        console.log(`onsignalingstatechange: ${peerConnection.signalingState}`);
      },
    });

    for (const track of stream.getTracks()) {
      peerConnection.addTrack(track,stream);
    }

    return peerConnection;
  }

  onConnect() {
    console.log("BaseClientApp#onConnect");
  }
  onDisconnect() {
    console.log("BaseClientApp#onDisconnect");
    //DO NOTHING
  }
  async onNeedToConnectAsync({peerId}){
    console.log("BaseClientApp#onNeedToConnectAsync",peerId);
    await this.setupPeerConnectionOfferAsync({
      peerId,
    });
  }
  async onNeedToDisconnectAsync({peerId}){
    console.log("BaseClientApp#onNeedToDisconnectAsync",peerId);
    await this.destroyPeerConnectionAsync({
      peerId,
    });
  }

  async onOfferAsync({from,sdp}){
    console.log("BaseClientApp#onOfferAsync",from,sdp);
    await this.setupPeerConnectionAnswerAsync({
      peerId:from,
      sdp,
    });
  }
  async onAnswerAsync({from,sdp}){
    console.log("BaseClientApp#onAnswerAsync",from,sdp);
    const peerConnection=this.peerConnectionMap.get(from);
    if(!peerConnection){
      throw new Error(`this.peerConnectionMap.get(from) is null: ${from}`);
    }
    peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
  }
  async onIcecandidateAsync({from,candidate}){
    console.log("BaseClientApp#onIcecandidateAsync",from,candidate);
    const peerConnection=this.peerConnectionMap.get(from);
    if(!peerConnection){
      throw new Error(`this.peerConnectionMap.get(from) is null: ${from}`);
    }
    await peerConnection.addIceCandidate(candidate);
  }
  async onSignalingAsync({to,from,type,sdp=null,candidate=null}){
    console.log("BaseClientApp#onSignalingAsync");
    switch(type){
      case "offer":
        this.onOfferAsync({from,sdp});
        break;
      case "answer":
        this.onAnswerAsync({from,sdp});
        break;
      case "icecandidate":
        this.onIcecandidateAsync({from,candidate});
        break;
    }
  }
}