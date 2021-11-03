export const IS_DEBUG=true;
export const FPS_CLIENT = 60;
export const FPS_SERVER = 10;
export const FPS_VIDEO = 10;
export const VIDEO_SIZE = 128;

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




