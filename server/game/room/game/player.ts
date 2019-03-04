import Command from "../../util/command";
import Component from '../../skeleton/component'
import { Action, checkCommand } from  "../../util/command";
import { JoinOption } from "../../util/interface";
import { nosync } from "colyseus";

export default class Player extends Component {
  status:Status = Status.Wait;
  bankroll:number = 1000;
  isBlind:boolean = false;
  userId:string;
  nick:string;
  position:number;
  isActive:boolean = false;
  networkStatus:NetworkStatus;

  @nosync
  id:string;
  @nosync
  hand:Array;
  @nosync
  isActionComplete:boolean = false;

  constructor(id:stirng, options:JoinOption, position:number) {
    super();
    this.id = id;
    this.position = position;
    this.name = options.name;
    this.userId = options.userId;
    this.isBlind = false;
    this.networkStatus = NetworkStatus.Connected;
    this.reset();
  }

  remove() {
    super.remove();
    this.hand = null;
  }

  reset(){
    this.hand = null;
    this.status = Status.Wait;
    this.isBlind = false;
  }

  isConnected():boolean {
    if(this.networkStatus == NetworkStatus.DisConnected) return false;
    return true;
  }

  waiting(){
    this.networkStatus = NetworkStatus.Wait;
  }

  reJoin(){
    this.networkStatus = NetworkStatus.Connected;
  }

  leave(){
    this.networkStatus = NetworkStatus.DisConnected;
  }

  isPlayAble(ante:number, ):boolean {
    if( this.networkStatus != NetworkStatus.Connected ) return false;
    if( ante > this.bankroll ) {
      this.status = Status.Impossible;
      return false;
    }
    return true;
  }

  start(ante:number, hand:Array) {
    this.bankroll -= ante;
    this.hand = hand;
    this.status = Status.Play;
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

  setActivePlayer(){
    this.isActive = true;
    this.isActionComplete = false;
  }

  setPassivePlayer(){
    this.isActive = false;
    if( !this.isActionComplete ) this.status = Status.Fold;
  }

  onBlindAction(){
    this.isBlind = true;
  }

  onAction (command: Command) {
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
    this.isActionComplete = true;
  }
}

enum Status{
  Wait = 1,
  Impossible,
  Fold,
	Play,
  AllIn
}

enum NetworkStatus{
  Connected = 1,
  DisConnected,
  Wait
}
