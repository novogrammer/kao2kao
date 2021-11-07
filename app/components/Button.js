
// import { useRef,useEffect} from 'react';

export default function Button(props){
  let classNameList=[props.className];
  const {buttonName,onButtonDown,onButtonUp}=props;
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
  <div className={classNameList.join(" ")} onMouseDown={onButtonDown.bind(null,buttonName)} onMouseUp={onButtonUp.bind(null,buttonName)} onTouchStart={onTouchStart.bind(null,buttonName)} onTouchEnd={onTouchEnd.bind(null,buttonName)} onTouchCancel={onTouchCancel.bind(null,buttonName)}>{props.children}</div>
  );
}