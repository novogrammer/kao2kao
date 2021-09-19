import Head from 'next/head'
import { useRef } from 'react';
import { useMount,useUnmount } from "react-use";
import ClientApp from "../client/ClientApp";

export default function Home() {
  const clientAppRef=useRef(null);
  const videoRef=useRef(null);



  useMount(async ()=>{
    const video=videoRef.current;
    const clientApp=new ClientApp({
      video,
    });
    window.clientApp=clientApp;
    clientAppRef.current=clientApp;
    await clientApp.setupPromise;
  });
  useUnmount(async ()=>{
    const clientApp=clientAppRef.current;
    await clientApp.destroyAsync();
  });

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <main>
        <video ref={videoRef} playsInline />
      </main>

    </div>
  )
}
