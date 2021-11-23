import Head from 'next/head'
import { useRef ,useState} from 'react';
import { useMount,useUnmount } from "react-use";
import MainClientApp from '../client/MainClientApp';
import { BUTTON_NAME_CAMERA_DOWN, BUTTON_NAME_CAMERA_LEFT, BUTTON_NAME_CAMERA_RIGHT, BUTTON_NAME_CAMERA_UP, BUTTON_NAME_MOVE_BACKWARD, BUTTON_NAME_MOVE_FORWARD, BUTTON_NAME_MOVE_LEFT, BUTTON_NAME_MOVE_RIGHT, MAIN_ROOM_CAPACITY, ROOM_MAIN, ROOM_WAITING } from '../common/constants';
// import RemoteVideo from '../components/RemoteVideo';
import Button from "../components/Button";
// import getConfig from "next/config";
// const { publicRuntimeConfig } = getConfig();

import styles from "../styles/Home.module.scss";

export default function Home({iceServers}) {
  const clientAppRef=useRef(null);
  const localVideoRef=useRef(null);
  const joinButtonRef=useRef(null);
  const [joined,setJoined]=useState(false);
  const [pending,setPending]=useState(false);
  const [populations,setPopulations]=useState({
    [ROOM_MAIN]:null,
    [ROOM_WAITING]:null,
  });

  const viewRef=useRef(null);

  useMount(async ()=>{
    const localVideo=localVideoRef.current;
    const view=viewRef.current;
    const clientApp=new MainClientApp({
      localVideo,
      iceServers,
      view,
      setJoined:(joined)=>{
        setJoined(joined);
        setPending(false);
      },
      setPopulations,
    });
    window.clientApp=clientApp;
    clientAppRef.current=clientApp;
    await clientApp.setupPromise;
  });
  useUnmount(async ()=>{
    const clientApp=clientAppRef.current;
    await clientApp.destroyAsync();
  });
  const onClickJoinAsync=async ()=>{

    const clientApp=clientAppRef.current;
    await clientApp.setupPromise;
    if(joinButtonRef.current!=null){
      // stateによるdisabledが追いつかないことがある
      joinButtonRef.current.disabled=true;
    }
    setPending(true);
    await clientApp.onClickJoinAsync();
  }
  const cameraClassNames=[
    styles["waiting__camera"],
  ];
  if(joined){
    cameraClassNames.push(styles["waiting__camera--joined"]);
  }
  const onButtonDown=(name)=>{
    const clientApp=clientAppRef.current;
    clientApp.onButtonDown(name);
  };
  const onButtonUp=(name)=>{
    const clientApp=clientAppRef.current;
    clientApp.onButtonUp(name);
  };
  const onTouchStart=(name,event)=>{
    event.preventDefault();
    onButtonDown(name,event);
  }
  const onTouchEnd=(name,event)=>{
    onButtonUp(name,event);
  }
  const onTouchCancel=(name,event)=>{
    onButtonUp(name,event);
  }

  return (
    <div className={styles.home}>
      <Head>
        <title>顔 to 顔</title>
        <meta name="description" content="気まぐれでサービスを停止します。" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <div className={styles.background}>
        <canvas ref={viewRef}></canvas>
      </div>
      <div className={styles.waiting}>
        <video className={cameraClassNames.join(" ")} ref={localVideoRef} autoPlay playsInline muted />
        {!joined && (
          <>
            <button ref={joinButtonRef} className={styles.waiting__join} onClick={onClickJoinAsync}disabled={pending}>join</button>
            <div className={styles.waiting__population}>Waiting Room:{populations[ROOM_WAITING]}</div>
            <div className={styles.waiting__population}>Main Room:{populations[ROOM_MAIN]}/{MAIN_ROOM_CAPACITY}</div>
          </>
        )}
      </div>
      {
        joined && (
          <div className={styles.controller}>
            <Button
              className={styles.controller__moveforward}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_MOVE_FORWARD}
            >↑</Button>
            <Button
              className={styles.controller__moveleft}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_MOVE_LEFT}
            >←</Button>
            <Button
              className={styles.controller__movebackward}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_MOVE_BACKWARD}
            >↓</Button>
            <Button
              className={styles.controller__moveright}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_MOVE_RIGHT}
            >→</Button>
            <Button
              className={styles.controller__cameraup}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_CAMERA_UP}
            >↑</Button>
            <Button
              className={styles.controller__cameraleft}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_CAMERA_LEFT}
            >←</Button>
            <Button
              className={styles.controller__cameradown}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_CAMERA_DOWN}
            >↓</Button>
            <Button
              className={styles.controller__cameraright}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_CAMERA_RIGHT}
            >→</Button>
          </div>
  
        )
      }

    </div>
  )
}

export async function getServerSideProps(context){
  const iceServers=[
    {
      urls: process.env.TURN_SERVER_URI,
      username:process.env.TURN_SERVER_USER,
      credential:process.env.TURN_SERVER_PASSWORD,
    },
  ];

  return {
    props:{
      iceServers,
    },
  };
}