import * as Rx from 'rxjs';
import { take } from 'rxjs/operators';
import { nosync } from "colyseus";

const GAME_SPEED:number = 1000;
const LIMIT_TIME:number = 30;
export default class Stage {
  ante: number = 1;
  mainPot: number;
  sidePot: number;
  turn: number;
  status:Status;
  communityCards:Array;
  time: number;


  @nosync
  currentPlayer:string;
  @nosync
  delegate:Rx.Subject;
  @nosync
  gameScheduler:Rx.Observable;
  @nosync
  gameTimeSubscription:Rx.Subscription;

  constructor(ante:number) {
    this.ante = ante;
    this.turn = 0;
    this.time = 0;
    this.delegate = null;
    this.gameScheduler = Rx.interval(GAME_SPEED);
  }

  remove() {
    if( this.gameTimeSubscription != null ) this.gameTimeSubscription.unsubscribe();
    this.reset();

  }

  reset(){
    this.currentPlayer = '';
    this.mainPot = 0;
    this.sidePot = 0;
    this.turn = 0;
    this.time = LIMIT_TIME;
    this.status = Status.wait;
    this.gameSubscription = null;
    this.ids = null;
  }

  start(ids:Array):Rx.Subject {
    this.ids = ids;
    this.currentPlayer = this.getCurrentPlayer();
    this.delegate = new Rx.Subject();
    this.gameTimeSubscription = this.gameTimeSubscription.pipe(take(LIMIT_TIME)).subscribe( {
      next :(t) => { this.onTime(); },
      complete :() => { this.onTurnComplete(); }
    });
    this.status = Status.Play;
    this.communityCards = [];
    return this.delegate;
  }

  getCurrentPlayer(): string{
    let idx = this.turn % this.ids.length;
    return this.ids[idx]
  }

  onTime(){
    this.time--;
  }

  onTurnComplete() {
    this.turn ++;
    this.currentPlayer = this.getCurrentPlayer();
    this.gameTimeSubscription.unsubscribe();
    this.gameTimeSubscription =null;
    this.status = Status.Complete;
    this.delegate.next(this.time);
  }

  onGameComplete(){
    this.delegate.complete(this.currentPlayer);
    this.delegate = null;
  }

}


enum Status{
  Wait = 1,
  Play,
  Complete
}
