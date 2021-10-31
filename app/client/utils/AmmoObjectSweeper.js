export default class AmmoObjectSweeper{
  constructor(AmmoLib){
    this.AmmoLib=AmmoLib;
    this.temporaryObjects=[];
    this.permanentObjects=[];
  }
  markTemporary(object){
    this.temporaryObjects.push(object);
    return object;
  }
  markPermanent(object){
    this.permanentObjects.push(object);
    return object;
  }
  destroyTemporaryObjects(){
    for(let temporaryObject of this.temporaryObjects){
      this.AmmoLib.destroy(temporaryObject);
    }
    this.temporaryObjects=[];
  }
  destroyPermanentObjects(){
    for(let permanentObject of this.permanentObjects){
      this.AmmoLib.destroy(permanentObject);
    }
    this.permanentObjects=[];
  }
}