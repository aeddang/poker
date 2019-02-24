
export default class Stage {
  ante: number = 1;
  mainPot: number
  sidePot: number
  constructor(ante:number) {
    this.ante = ante;

  }
  reset(){
    this.mainPot = 0;
    this.sidePot = 0;
  }

}
