import Head from 'next/head'
import { useRef ,useState} from 'react';
import { useMount,useUnmount } from "react-use";
import MainClientApp from '../client/MainClientApp';
import { BUTTON_NAME_CAMERA_DOWN, BUTTON_NAME_CAMERA_LEFT, BUTTON_NAME_CAMERA_RIGHT, BUTTON_NAME_CAMERA_UP, BUTTON_NAME_MOVE_BACKWARD, BUTTON_NAME_MOVE_FORWARD, BUTTON_NAME_MOVE_LEFT, BUTTON_NAME_MOVE_RIGHT, MAIN_ROOM_CAPACITY, ROOM_MAIN, ROOM_WAITING } from '../common/constants';
// import RemoteVideo from '../components/RemoteVideo';
import Button from "../components/Button";
// import getConfig from "next/config";
// const { publicRuntimeConfig } = getConfig();
import Modal from 'react-modal';

import styles from "../styles/Home.module.scss";

// Modal.setAppElement('#MyAppElement');

export default function Home({iceServers}) {
  const clientAppRef=useRef(null);
  const localVideoRef=useRef(null);
  const joinButtonRef=useRef(null);
  const [muted,setMuted]=useState(false);
  const [joined,setJoined]=useState(false);
  const [pending,setPending]=useState(false);
  const [populations,setPopulations]=useState({
    [ROOM_MAIN]:null,
    [ROOM_WAITING]:null,
  });
  const [modalIsOpen, setIsOpen] = useState(false);
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }  


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
  const onButtonDown=(name,event)=>{
    event.preventDefault();
    event.stopPropagation();
    const clientApp=clientAppRef.current;
    clientApp.onButtonDown(name);
  };
  const onButtonUp=(name,event)=>{
    event.preventDefault();
    event.stopPropagation();
    const clientApp=clientAppRef.current;
    clientApp.onButtonUp(name);
  };


  const onClickMute=(event)=>{
    const clientApp=clientAppRef.current;
    const nextMuted=!muted;
    clientApp.setMuted(nextMuted);
    setMuted(nextMuted);
  }

  return (
    <div className={styles.home}>
      <Head>
        <title>顔 to 顔</title>
        <meta name="description" content="気まぐれでサービスを停止します。" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet"></link>
      </Head>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        styles={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
          },
        }}

      >
        <h2 className={styles.howto__title}>遊び方</h2>
        <p className={styles.howto__text}>
          顔と顔を合わせることがなくなりました。<br/>
          Web会議は大勢から正面から見つめられている気がして苦手です。<br/>
          バーチャル空間で少人数で顔と顔を合わせられるようにしました。<br/>
          <br/>
          この作品では、近くにいる人の声が大きく聞こえます。<br/>
          落ち着いて話したい時は近づきましょう。<br/>
          うるさい声や、聞きたくない話からは離れましょう。<br/>
          <a href="https://github.com/novogrammer/kao2kao" target="_blank">GitHub</a>
        </p>
        <img className={styles.howto__image} src="/assets/img/howto.jpg" alt="howto" />
        <button className={styles.howto__close} onClick={closeModal}>閉じる</button>
      </Modal>
      <div className={styles.background}>
        <canvas ref={viewRef}></canvas>
      </div>
      <div className={styles.waiting}>
        <video className={cameraClassNames.join(" ")} ref={localVideoRef} autoPlay playsInline muted />
        {!joined && (
          <>
            <button ref={joinButtonRef} className={styles.waiting__join} onClick={onClickJoinAsync}disabled={pending}>スタート</button>
            <button className={styles.waiting__howto} onClick={openModal}>遊び方</button>
            <div className={styles.waiting__population}>待ち人数:{populations[ROOM_WAITING]}</div>
            <div className={styles.waiting__population}>部屋の人数:{populations[ROOM_MAIN]}/{MAIN_ROOM_CAPACITY}</div>
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
            >W</Button>
            <Button
              className={styles.controller__moveleft}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_MOVE_LEFT}
            >A</Button>
            <Button
              className={styles.controller__movebackward}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_MOVE_BACKWARD}
            >S</Button>
            <Button
              className={styles.controller__moveright}
              onButtonDown={onButtonDown}
              onButtonUp={onButtonUp}
              buttonName={BUTTON_NAME_MOVE_RIGHT}
            >D</Button>
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
            {
              muted?(<div
                className={styles.controller__mute}
                onClick={onClickMute}
              ><span className="material-icons" style={{fontSize:"100%"}}>&#xE02B;&#xE04F;</span></div>):(<div
                className={styles.controller__mute}
                onClick={onClickMute}
              ><span className="material-icons" style={{fontSize:"100%"}}>&#xE029;&#xE050;</span></div>)
            }
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