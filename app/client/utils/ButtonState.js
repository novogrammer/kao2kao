

export default class ButtonState{
  constructor(){
    this.previousPressState=false;
    this.currentPressState=false;
    this.newPressState=false;
  }
  update(){
    this.previousPressState=this.currentPressState;
    this.currentPressState=this.newPressState;
  }
  setNewPressState(newPressState){
    this.newPressState=newPressState;
  }
  isOnDown(){
    return !this.previousPressState && this.currentPressState;
  }
  isOnUp(){
    return this.previousPressState && !this.currentPressState;
  }

}