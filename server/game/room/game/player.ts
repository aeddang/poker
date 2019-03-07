import Command from "../../util/command";
import Component from '../../skeleton/component'
import { Action, checkCommand } from  "../../util/command";
import { JoinOption } from "../../util/interface";
import { nosync } from "colyseus";

export default class Player extends Component {
  status:Status = Status.Absence;
  bankroll:number = 1000;
  isBlind:boolean = false;
  userId:string;
  name:string;
  position:number = -1;
  isDealler:boolean = false;
  isActive:boolean = false;
  networkStatus:NetworkStatus;
  gameBat:number = 0;
  checkBat:number = 0;
  time:number = 0;
  openHand:Array;
  currentAction:Array;

  @nosync
  id:string;
  @nosync
  hand:Array;
  @nosync
  isActionComplete:boolean = false;


  constructor(id:stirng, options:JoinOption) {
    super();
    this.id = id;
    this.name = options.name;
    this.userId = options.userId;
    this.networkStatus = NetworkStatus.Connected;
  }

  remove() {
    super.remove();
    this.hand = null;
    this.openHand = null;
    this.currentAction = null;
  }

  isConnected():boolean {
    if(this.networkStatus == NetworkStatus.DisConnected) return false;
    return true;
  }

  waiting(){
    this.networkStatus = NetworkStatus.Wait;
  }

  isJoinGameAble(){
    return this.status == Status.WaitBigBlind || this.status == Status.Absence;
  }

  joinGame( position:number, isPlaying:boolean){
    this.position = position;
    this.status = isPlaying ? Status.WaitBigBlind : Status.Wait;
  }

  isRejoinAble():boolean {
    return this.networkStatus == NetworkStatus.Wait;
  }

  reJoin(){
    this.networkStatus = NetworkStatus.Connected;
  }

  leave(){
    this.networkStatus = NetworkStatus.DisConnected;
  }

  isPlayAble(minBankroll:number, posIdx:int):boolean {
    if( this.networkStatus != NetworkStatus.Connected ) return false;
    if( this.status == Status.Absence ) return false;
    if( this.status == Status.WaitBigBlind && posIdx != 2 ) return false;
    if( minBankroll > this.bankroll ) {
      this.status = Status.Impossible;
      return false;
    }
    return true;
  }

  startDisable () {
    if( this.status != Status.Absence) this.status = Status.Wait
  }

  reset(){
    this.hand = null;
    if( this.status != Status.Absence & this.status != Status.WaitBigBlind ) this.status = Status.Wait;
    this.isBlind = false;
    this.isDealler = false;
    this.time = 0;
    this.currentAction = [Action.Blind];
  }

  start(hand:Array) {
    this.hand = hand;
    this.openHand = [];
    this.currentAction = [];
    this.status = Status.Play;
    this.currentAction = [];
  }

  nextRound() {
    this.gameBat = 0;
  }

  batting(amount:number):boolean{
    if( amount > this.bankroll ) return false;
    this.gameBat += amount;
    this.bankroll -= amount;
    return true;
  }

  showDown(){
    if(this.status == Status.Impossible || this.status == Status.Wait) return;
    this.status = Status.ShowDown;
    this.openHand = this.hand;
  }

  isActionAble():boolean {
    switch( this.status ){
      case Status.Fold :
      case Status.AllIn :
      case Status.Impossible :
      case Status.Wait :
        return false;
      default: return true;
    }
  }

  setActivePlayer(action:Array, turnBat:number, minBat:number){
    this.checkBat = turnBat - this.gameBat;
    let bat = this.checkBat + minBat;
    this.currentAction = action.map( ac => {
      switch(ac){
        case Action.Check:
        case Action.Call:
          if( this.checkBat >= this.bankroll) return Action.AllIn;
          break;
        case Action.Bat:
        case Action.Raise:
          if( bat >= this.bankroll) return Action.AllIn;
          break;
        case Action.BigBlind:
          if( minBat >= this.bankroll) return Action.AllIn;
          break
      }
      return ac;
    });
    this.isActive = true;
    this.isActionComplete = false;
  }

  setPassivePlayer(){
    this.isActive = false;
    this.time = 0;
    if( !this.isActionComplete ) this.status = Status.Fold;
  }

  blindAction(){
    this.isBlind = true;
  }

  action (command: Command) {
    switch(command.t) {
      case Action.Fold: this.status = Status.Fold; break;
    	case Action.Raise: this.status = Status.Play; break;
      case Action.Check: this.status = Status.Play; break;
    	case Action.Call: this.status = Status.Play; break;
      case Action.Bat: this.status = Status.Play; break;
      case Action.AllIn: this.status = Status.AllIn; break;
    	case Action.SmallBlind: this.status = Status.Play; break;
    	case Action.BigBlind: this.status = Status.Play; break;
    }
    this.time = 0;
    this.checkBat = 0;
    this.currentAction = [];
    this.isActionComplete = true;
  }
}

enum Status{
  Wait = 1,
  Impossible,
  Fold,
	Play,
  AllIn,
  ShowDown,
  Absence,
  WaitBigBlind
}

enum NetworkStatus{
  Connected = 1,
  DisConnected,
  Wait
}
