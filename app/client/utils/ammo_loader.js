

let ammoLibPromise=null;

export default function getAmmoLibAsync(){
  if(!ammoLibPromise){
    ammoLibPromise=new Promise((resolve,reject)=>{
      const script = document.createElement('script');
      script.onload=async ()=>{
        const AmmoLib=await window.Ammo();
        resolve(AmmoLib);
      }
      script.onerror=reject;
      script.src = '/assets/js/ammo/ammo.js';
      document.body.appendChild(script);
    });
  }
  return ammoLibPromise;
}