
import { useRef,useEffect} from 'react';

export default function RemoteVideo(props){
  const videoRef=useRef();
  useEffect(()=>{
    videoRef.current.srcObject=props.stream;
  })
  return <video ref={videoRef} autoPlay playsInline muted={props.muted}/>;
}