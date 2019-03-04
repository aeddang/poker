import { EntityMap, nosync } from "colyseus";
import Component from '../../skeleton/component'
import { JoinOption } from "../../util/interface"
import Command, * as Cmd from  "../../util/command";
import { Action, checkCommand } from  "../../util/command";
import * as Rx from 'rxjs';
import { take } from 'rxjs/operators';
import Event from  "../../util/event";

import Player  from  "./player";
import Stage from  "./stage";
import Dealler from  "./dealler";


const WAIT_TIME:number = 3000;
const MIN_GAME_PLAYER:number = 2;

export const GAME_EVENT = Object.freeze ({
	PUSH: "push"
});


export default class Game extends Component {
  players: EntityMap< Player >;
  stage: Stage;

  @nosync
  dealler: Dealler;
	@nosync
  delegate:Rx.Subject;
	@nosync
	currentPlayer:Player;
  @nosync
	startPlayer:Player;
  @nosync
	playerNum:number = 0;

  constructor(ante: number, maxClients:number) {
		super();
		this.players = {};
    this.dealler = new Dealler();
    this.stage = new Stage(ante, maxClients);
    this.delegate = new Rx.Subject();
  }

  remove() {
    this.stage.remove();
		this.dealler.remove();
    this.delegate.complete();
    for (let id in this.players) this.players[id].remove();
    this.players = null;
    this.startPlayer = null;
    this.currentPlayer = null;
		this.dealler = null;
    this.delegate = null;
		super.remove();
  }

  start(delay){
    if(  this.playerNum < MIN_GAME_PLAYER ) return;
    this.onGameReset();
    this.debuger.log('start');
    Rx.interval(WAIT_TIME).pipe(take(1)).subscribe(e => {
      let ids = this.getGameStartAblePlayers();
      if( ids.length < MIN_GAME_PLAYER ) {
        this.onGameError();
        return;
      }
      this.stage.start(ids).subscribe ({
        next :(t) => { this.onGameNextTurn(); },
        complete :() => { this.onGameComplete(); }
      });
      this.onGameStart( ids );
      this.onGameTurnStart();
    });
  }

  getGameStartAblePlayers():Array<String> {
    let ids:Array<String> = [];
    for (let id in this.players) {
      if( this.players[id].isPlayAble(this.stage.ante) ) ids.push(id);
    }
		this.debuger.log(ids);
    return ids;
  }

  onGameReset(){
    this.stage.reset();
    this.dealler.reset();
    this.startPlayer = null;
    this.currentPlayer = null;
    for (let id in this.players) this.players[id].reset();
  }

  onGameStart( ids:Array<String> ) {
    ids.forEach( id => {
      let hand = this.dealler.getHand();
      this.players[id].start( this.stage.ante, hand );
      if( this.players[id].isBlind ) return;
      this.delegate.next( new Event( GAME_EVENT.PUSH, {id:id, value:hand}) );
    })
    this.debuger.log('onGameStart');
  }

  onGameTurnStart(){
    this.removeCurrentPlayer();
		this.startPlayer = this.players[ this.stage.currentID ];
    this.setCurrentPlayer( this.startPlayer );
    this.debuger.log('onGameTurnStart');
    this.stage.turnStart();
  }

  onGameNextTurn(playerId){
    this.removeCurrentPlayer();
    let nextPlayer = this.players[ this.stage.currentID ];
    if( nextPlayer == this.startPlayer ) {
      this.debuger.log('turn complete');
      this.stage.onGameComplete();
      return;
    }
    if( !nextPlayer.isActionAble() ) {
      this.debuger.log('turn pass');
      this.stage.onTurnComplete();
      return;
    }
    this.debuger.log('turn next');
    this.setCurrentPlayer( nextPlayer );
    this.stage.turnStart();
  }

  removeCurrentPlayer() {
    if(this.currentPlayer == null) return;
    this.currentPlayer.setPassivePlayer();
    this.currentPlayer = null;
  }

  setCurrentPlayer(player:Player) {
    this.currentPlayer = player;
    player.setActivePlayer();
  }

  onAction (id: string, command: Command) {
    if(Cmd.BlindAction){
      this.players[ id ].onBlindAction();
      return;
    }
    if( this.currentPlayer == null ) return;
    if( id != this.currentPlayer.id ) return;

		this.debuger.log(command, 'onAction');
    switch(command.t) {
    	case Action.Raise:
			case Action.Bat:
			case Action.SmallBlind:
			case Action.BigBlind:
        this.startPlayer = this.currentPlayer;
        break;
    }
    this.players[ id ].onAction(command);
    this.stage.onTurnComplete();
  }

  onGameError() {
    this.debuger.log('onGameError');
    this.stage.onGameComplete();
    this.onGameComplete();
  }

	onGameComplete() {
		this.debuger.log('onGameComplete');
    for (let id in this.players) if( !this.players[id].isConnected() ) this.leaveCompleted(id);
    this.start();
  }

  isJoinAble():boolean {
    return this.stage.isJoinAble;
  }

  join(id:string, options:JoinOption) {
    let position = this.stage.joinPosition( id );
		if(this.players[ id ] == undefined) {
			this.players[ id ] = new Player(id, options, position);
    	this.playerNum ++;
		} else {
			this.players[ id ].reJoin();
		}
		this.debuger.log(this.playerNum, 'join player num');
    if( !this.stage.isStart() ) this.start();
  }

  waiting(id:string){
    this.players[ id ].waiting();
  }

  reJoin(id:string){
    this.players[ id ].reJoin();
  }

  leave(id:string): string {
    this.playerNum --;
    let nick = this.players[ id ].name;
    if( this.stage.hasPlayer( id ) ) {
      this.players[ id ].leave();
			this.debuger.log(this.players[ id ], 'leave');
    } else {
			this.debuger.log(this.players[ id ], 'leaveComplete');
      this.leaveCompleted(id);
    }
    return nick;
  }

  leaveCompleted(id:string) {
    this.stage.leavePosition( id );
    delete this.players[ id ];
  }

  getPlayerData (id: string): PlayerData {
     return this.players[ id ];
  }
}
