import * as Rx from 'rxjs';
import { take } from 'rxjs/operators';
import { nosync } from "colyseus";
import { Action } from  "../../util/command";
import Component from '../../skeleton/component'
import Event from  "../../util/event";

const GAME_SPEED:number = 1000;
const LIMIT_TIME:number = 30;

export const STAGE_EVENT = Object.freeze ({
	NEXT_TURN: "nextTurn",
  COMPLETE_TURN: "completeTurn",
	TIME_CHANGED: "timeChanged",
  CURRENT_PLAYER_CHANGED: "currentPlayerChanged"
});

export enum Status{
  Wait = 1,
  FreeFlop,
  Flop,
  Turn,
  ShowDown
}


export default class Stage extends Component {
  ante:number = 1;
  gameRule:number = 2;
  isLimited:boolean = false;
  mainPot:number;
  sidePot:number;
  status:Status;
  communityCards:Array;

  minBat:number;
  turnBat:number;


  @nosync
	time:number;
  @nosync
  turn:number;
  @nosync
  ids:Array<String>;
  @nosync
  currentID:string;
  @nosync
  dellerID:string;
  @nosync
  delegate:Rx.Subject;
  @nosync
  gameScheduler:Rx.Observable;
  @nosync
  gameTimeSubscription:Rx.Subscription;
  @nosync
  didBat:boolean = false;
  @nosync
  smallBlindBat:number;
  @nosync
  bigBlindBat:number;
  @nosync
  minBankroll:number;

  constructor(ante:number, gameRule:number) {
    super();
    this.ante = ante;
    this.gameRule = gameRule;
    this.smallBlindBat = ante * gameRule;
    this.bigBlindBat = this.smallBlindBat * 2;
    this.minBankroll = this.bigBlindBat + ante;
    this.status = Status.Wait;
    this.turn = 0;
    this.time = 0;
    this.delegate = null;
    this.gameScheduler = Rx.interval(GAME_SPEED);
  }

  remove() {
    super.remove();
    this.removeTimeSubscription();
    this.removeDelegate();
    this.gameTimeSubscription = null;
    this.gameScheduler = null;
    this.ids = null;
    this.communityCards = null;
    this.positions = null;
  }

  removeTimeSubscription() {
    if( this.gameTimeSubscription != null ) this.gameTimeSubscription.unsubscribe();
    this.gameTimeSubscription = null;
  }

  removeDelegate() {
    if( this.delegate != null ) this.delegate.unsubscribe();
    this.delegate = null;
  }

  isStart():boolean {
    if( this.status == Status.Wait ) return false;
    return true;
  }

  hasPlayer( id:string ):boolean {
    if( this.ids == null ) return false;
    if( this.ids.indexOf( id ) == -1 ) return false;
    return true;
  }

  reset(){
    this.currentID = '';
    this.mainPot = 0;
    this.sidePot = 0;
    this.didBat = false;
    this.turn = 0;
    this.time = LIMIT_TIME;
    this.status = Status.Wait;
    this.gameTimeSubscription = null;
    this.ids = null;
  }

  start(ids:Array):Rx.Subject {
    this.ids = ids;
    this.delegate = new Rx.Subject();
    this.status = Status.FreeFlop;
    this.communityCards = [];
    return this.delegate;
  }

  turnStart( burnCards:Array ) {
    this.turnBat = 0;
    this.turn = 1;
    this.didBat = false;
    this.minBat = this.bigBlindBat;
    this.communityCards = this.communityCards.concat( burnCards );
    this.currentID = this.getCurrentID();
    this.delegate.next( new Event( STAGE_EVENT.CURRENT_PLAYER_CHANGED , this.currentID ) );
    this.turnNext();
  }

  turnNext() {
    this.time = LIMIT_TIME;
    this.gameTimeSubscription = this.gameScheduler.pipe(take(LIMIT_TIME)).subscribe( {
      next :(t) => { this.onTime(); },
      complete :() => { this.onTurnComplete(); }
    });
  }

  onTime(){
    this.time--;
		this.delegate.next( new Event( STAGE_EVENT.TIME_CHANGED , this.time ) );
  }

  onTurnComplete() {
    this.turn ++;
    this.currentID = this.getCurrentID();
    this.removeTimeSubscription();
    this.delegate.next( new Event( STAGE_EVENT.CURRENT_PLAYER_CHANGED , this.currentID ) );
    this.delegate.next( new Event( STAGE_EVENT.NEXT_TURN , this.currentID ) );
  }

	batting(amount:number){
    if( this.minBat < amount ) this.minBat = amount;
    this.turnBat += amount;
    this.mainPot += amount;
  }

  nextRound() {
    this.status ++;
    if(this.status == Status.ShowDown) this.delegate.complete();
    else this.delegate.next( new Event( STAGE_EVENT.COMPLETE_TURN , this.status ) );
  }

  complete(){
    this.removeDelegate();
  }

  action (command: Command) {
    switch(command.t) {
      case Action.Bat: this.didBat = true; break;
      case Action.AllIn: ; break;
    }
    this.onTurnComplete();
  }

  getActions():Array{
    if(this.status == Status.FreeFlop){
      if( this.turn == 1 ) return [ Action.SmallBlind ];
      if( this.turn == 2 ) return [ Action.BigBlind ];
    } else {
      if( this.turn == 1 ) return [ Action.BigBlind ];
    }
    if( !this.didBat ) return [ Action.Bat, Action.Check, Action.Fold ];
    return [ Action.Raise, Action.Call, Action.Fold ];
  }

  getCurrentID(): string{
    let idx = this.turn % this.ids.length;
    return this.ids[idx]
  }
}
