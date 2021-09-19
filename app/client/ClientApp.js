import io from 'socket.io-client';
import { EVENT_NEED_TO_CONNECT, EVENT_SIGNALING, VIDEO_SIZE } from '../common/constants';

export default class ClientApp{
  constructor({video}){
    Object.assign(this,{
      video,
    })
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
    const options={};
    this.socket=io(options);
    const {socket}=this;

    socket.on("connect",this.getBind("onConnect"));

    socket.on(EVENT_NEED_TO_CONNECT,this.getBind("onNeedToConnectAsync"));
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
    const { video } = this;
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: VIDEO_SIZE,
        height: VIDEO_SIZE
      },
    });
    video.srcObject = stream;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve();
      };
    });
    video.play();


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
      console.log("destroy!");
      //TODO destroy
    }
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
    const {stream, socket}=this;
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:127.0.0.1:3478",
        }
      ]
    });
    Object.assign(peerConnection,{
      onicecandidate:(event)=>{
        const {candidate}=event;
        console.log(`onicecandidate candidate: ${candidate}`);
        socket.emit(EVENT_SIGNALING,{
          type:"icecandidate",
          to:peerId,
          candidate,
        });
    
      },
      ontrack:()=>{
        console.log("ontrack");
      },
      onnegotiationneeded:()=>{
        console.log("onnegotiationneeded");
      },
      onremovetrack:()=>{
        console.log("onremovetrack");
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
    console.log("ClientApp#onConnect");
  }
  onDisconnect() {
    console.log("ClientApp#onDisconnect");
    //DO NOTHING
  }
  async onNeedToConnectAsync({id}){
    console.log("ClientApp#onNeedToConnectAsync",id);
    await this.setupPeerConnectionOfferAsync({
      peerId:id,
    });
  }
  async onOfferAsync({from,sdp}){
    console.log("ClientApp#onOfferAsync",from,sdp);
    await this.setupPeerConnectionAnswerAsync({
      peerId:from,
      sdp,
    });
  }
  async onAnswerAsync({from,sdp}){
    console.log("ClientApp#onAnswerAsync",from,sdp);
    const peerConnection=this.peerConnectionMap.get(from);
    if(!peerConnection){
      throw new Error(`this.peerConnectionMap.get(from) is null: ${from}`);
    }
    peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
  }
  async onIcecandidateAsync({from,candidate}){
    console.log("ClientApp#onIcecandidateAsync",from,candidate);
    const peerConnection=this.peerConnectionMap.get(from);
    if(!peerConnection){
      throw new Error(`this.peerConnectionMap.get(from) is null: ${from}`);
    }
    await peerConnection.addIceCandidate(candidate);
  }
  async onSignalingAsync({to,from,type,sdp=null,candidate=null}){
    console.log("ClientApp#onSignalingAsync");
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