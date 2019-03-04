import * as Rx from 'rxjs';
import { take } from 'rxjs/operators';
import { nosync } from "colyseus";
import Component from '../../skeleton/component'

const GAME_SPEED:number = 1000;
const LIMIT_TIME:number = 30;
export default class Stage extends Component {
  ante:number = 1;
  maxPlayer:number;
  mainPot:number;
  sidePot:number;
  status:Status;
  communityCards:Array;
  time:number;
  currentID:string;

  @nosync
  turn:number;
  @nosync
  ids:Array<String>;
  @nosync
  positions:Array<string>;
  @nosync
  delegate:Rx.Subject;
  @nosync
  gameScheduler:Rx.Observable;
  @nosync
  gameTimeSubscription:Rx.Subscription;
  @nosync
  isJoinAble:boolean = true;


  constructor(ante:number, maxClients:number) {
    super();
    this.maxPlayer = maxClients;
    this.status = Status.Complete;
    this.positions = Array(maxClients);
    this.ante = ante;
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
    if( this.delegate != null ) this.delegate.complete();
    this.delegate = null;
  }

  reset(){
    this.currentID = '';
    this.mainPot = 0;
    this.sidePot = 0;
    this.turn = 0;
    this.time = LIMIT_TIME;
    this.status = Status.Wait;
    this.gameTimeSubscription = null;
    this.ids = null;
    this.debuger.log(this.currentID, 'reset');
  }

  joinPosition( id:string ):number {
    let idx = this.positions.findIndex( pos => pos == null );
    this.positions[idx] = id;
    if(idx == (this.maxPlayer-1)) this.isJoinAble = false;
    return idx;
  }

  leavePosition( id:string ):number {
    let idx = this.positions.findIndex( pos => pos === id );
    this.positions[idx] = null;
    this.isJoinAble = true;
    return idx;
  }

  isStart():boolean {
    if( this.status == Status.Complete ) return false;
    return true;
  }

  hasPlayer( id:string ):boolean {
    if( this.ids == null ) return false;
    if( this.ids.indexOf( id ) == -1 ) return false;
    return true;
  }

  start(ids:Array):Rx.Subject {
    this.ids = ids;
    this.currentID = this.getCurrentID();
    this.delegate = new Rx.Subject();
    this.status = Status.Play;
    this.communityCards = [];
    return this.delegate;
  }

  turnStart() {
    this.gameTimeSubscription = this.gameScheduler.pipe(take(LIMIT_TIME)).subscribe( {
      next :(t) => { this.onTime(); },
      complete :() => { this.onTurnComplete(); }
    });
  }

  onTime(){
    this.time--;
  }

  onTurnComplete() {
    this.turn ++;
    this.time = LIMIT_TIME;
    this.currentID = this.getCurrentID();
    this.removeTimeSubscription();
    this.delegate.next(this.time);
  }

  onGameComplete(){
    this.status = Status.Complete;
    this.removeDelegate();
  }

  getCurrentID(): string{
    let idx = this.turn % this.ids.length;
    return this.ids[idx]
  }
}

enum Status{
  Wait = 1,
  Play,
  Complete
}
