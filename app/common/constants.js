export const IS_DEBUG=true;
export const IS_DEBUG_CAMERA=false;
export const FPS_CLIENT = 60;
export const FPS_MESSAGE = 10;
export const FPS_SERVER = 10;
export const FPS_VIDEO = 10;
export const VIDEO_SIZE = 128;

export const CAPSULE_HEIGHT=2;


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


// {
//   peerId:string,
// }
export const EVENT_NEED_TO_CONNECT ="need to connect";
// {
//   peerId:string,
// }
export const EVENT_NEED_TO_DISCONNECT ="need to disconnect";

// {
//   peerId:string,
// }
export const EVENT_ADD_PEER="add peer";
// {
//   peerId:string,
// }
export const EVENT_REMOVE_PEER="remove peer";

// {
//   transform:{
//     position:Number[3],
//     quaternion:Number[4],
//   },
// }
export const EVENT_MY_MOVE="my move";
// {
//   peerId:string,
//   transform:{
//     position:Number[3],
//     quaternion:Number[4],
//   },
// }
export const EVENT_THEIR_MOVE="their move";

// {
//   type:string,
//   // upstreamにはfromは含まれない
//   from:string,
//   to:string,
// }
export const EVENT_SIGNALING="signaling";

//返信で可否を返す
// {
//   room:string,
// }
export const EVENT_JOIN="join";

export const ROOM_SIMPLE="simple";
export const ROOM_WAITING="waiting";
export const ROOM_MAIN="main";



//ammo.js
// see btCollisionObject.h
export const DISABLE_DEACTIVATION=4