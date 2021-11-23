export const IS_DEBUG=true;
export const IS_DEBUG_CAMERA=false;
export const FPS_CLIENT = 60;
export const FPS_MESSAGE = 10;
export const FPS_SERVER = 10;
export const FPS_VIDEO = 10;
export const VIDEO_SIZE = 128;

export const CAPSULE_HEIGHT=2;

export const ACTION_WEIGHT_VELOCITY=1;

export const MAIN_ROOM_CAPACITY=10;

const DEG_TO_RAD = Math.PI/180;
export const PLAYER_ROTATION_OFFSET = 360*3/20 * DEG_TO_RAD;
export const PLAYER_CAMERA_ROTATION_X_RANGE=45*DEG_TO_RAD;
export const PLAYER_CAMERA_ROTATION_Y_RANGE=30*DEG_TO_RAD;
export const PLAYER_CAMERA_Z=2;
// [N]
export const PLAYER_MOVE_FORCE=20;
// [rad/s]
export const PLAYER_ANGULAR_VELOCITY=60*DEG_TO_RAD;

export const KEY_CODE_KEY_W="KeyW";
export const KEY_CODE_KEY_A="KeyA";
export const KEY_CODE_KEY_S="KeyS";
export const KEY_CODE_KEY_D="KeyD";

export const KEY_CODE_ARROW_UP="ArrowUp";
export const KEY_CODE_ARROW_LEFT="ArrowLeft";
export const KEY_CODE_ARROW_DOWN="ArrowDown";
export const KEY_CODE_ARROW_RIGHT="ArrowRight";

export const BUTTON_NAME_MOVE_FORWARD="ButtonMoveForward";
export const BUTTON_NAME_MOVE_LEFT="ButtonMoveLeft";
export const BUTTON_NAME_MOVE_BACKWARD="ButtonMoveBackward";
export const BUTTON_NAME_MOVE_RIGHT="ButtonMoveRight";

export const BUTTON_NAME_CAMERA_UP="ButtonCameraUp";
export const BUTTON_NAME_CAMERA_LEFT="ButtonCameraLeft";
export const BUTTON_NAME_CAMERA_DOWN="ButtonCameraDown";
export const BUTTON_NAME_CAMERA_RIGHT="ButtonCameraRight";

// type PacketVector3 = [number,number,number];
// type PacketQuaternion = [number,number,number,number];

// interface PacketNeedToConnect{
//   peerId:string;
// }
export const EVENT_NEED_TO_CONNECT ="need to connect";
// interface PacketNeedToDisconnect{
//   peerId:string;
// }
export const EVENT_NEED_TO_DISCONNECT ="need to disconnect";

// interface PacketAddPeer{
//   peerId:string;
// }
export const EVENT_ADD_PEER="add peer";
// interface PacketRemovePeer{
//   peerId:string;
// }
export const EVENT_REMOVE_PEER="remove peer";

// interface PacketMyMove{
//   transform:{
//     position:PacketVector3;
//     quaternion:PacketQuaternion;
//   };
//   cameraRotationX:number;
//   cameraRotationY:number;
//   runningWeight:number;
//   playerRotation:number;
// }
export const EVENT_MY_MOVE="my move";
// interface PacketTheirMove{
//   peerId:string;
//   transform:{
//     position:PacketVector3;
//     quaternion:PacketQuaternion;
//   };
//   cameraRotationX:number;
//   cameraRotationY:number;
//   runningWeight:number;
//   playerRotation:number;
// }
export const EVENT_THEIR_MOVE="their move";

// interface PacketSignaling{
//   type:string;
//   // upstreamにはfromは含まれない
//   from?:string;
//   to:string;
// }
// interface PacketSignalingOffer extends PacketSignaling{
//   sdp:RTCSessionDescription;
// }
// interface PacketSignalingAnswer extends PacketSignaling{
//   sdp:RTCSessionDescription;
// }
// interface PacketSignalingIceCandiate extends PacketSignaling{
//   candidate:RTCIceCandidate;
// }
export const EVENT_SIGNALING="signaling";

//返信で可否を返す
// interface PacketJoin{
//   room:string;
// }
// interface PacketJoinReponse{
//   wasSucceeded:boolean;
//   playerRotation?:number;
// }
export const EVENT_JOIN="join";

// interface PacketPopulation{
//   [ROOM_WAITING]:number;
//   [ROOM_MAIN]:number;
// }
export const EVENT_POPULATION="population"

export const ROOM_SIMPLE="simple";
export const ROOM_WAITING="waiting";
export const ROOM_MAIN="main";



//ammo.js
// see btCollisionObject.h
export const DISABLE_DEACTIVATION=4