import { EntityMap, nosync } from "colyseus";
import Component from '../../skeleton/component'
import { JoinOption } from "../../util/interface"
import Command, * as Cmd from  "../../util/command";
import { Action, checkCommand } from  "../../util/command";
import * as Rx from 'rxjs';
import { take } from 'rxjs/operators';
import Event from  "../../util/event";

import Player  from  "./player";
import Stage, * as Stg from  "./stage";
import Dealler from  "./dealler";


const WAIT_TIME:number = 5000;
const NEXT_ROUND_TIME:number = 3000;
const MIN_GAME_PLAYER:number = 2;

export const GAME_EVENT = Object.freeze ({
	PUSH: "push"
});


export default class Game extends Component {
  players: EntityMap< Player >;
  stage: Stage;
	maxPlayer:number;
	dealler: Dealler;

	@nosync
  delegate:Rx.Subject;
	@nosync
	currentPlayer:Player;
  @nosync
	playerNum:number = 0;
  @nosync
	positions:Array;
	@nosync
	deallerButton:number = 0;

	@nosync
  isStart: boolean = false;

  constructor(ante: number, gameRule:number, maxClients:number) {
		super();
		this.maxPlayer = maxClients;
		this.players = {};
		this.positions = Array(maxClients);
    this.dealler = new Dealler();
    this.stage = new Stage(ante, gameRule);
    this.delegate = new Rx.Subject();
  }

  remove() {
    this.stage.remove();
		this.dealler.remove();
    this.delegate.complete();
    for (let id in this.players) this.players[id].remove();
    this.players = null;
    this.currentPlayer = null;
		this.dealler = null;
    this.delegate = null;
		super.remove();
  }

  start(delay){
		this.onReset();
    if(  this.playerNum < MIN_GAME_PLAYER ){
			this.onStartDisable();
			return;
		}
    this.debuger.log('start');
		this.isStart = true;
    Rx.interval(WAIT_TIME).pipe(take(1)).subscribe(e => {
			let ids = this.getGameStartAblePlayers( );
      if( ids.length < MIN_GAME_PLAYER ) {
        this.onStartDisable( true );
        return;
      }
      this.stage.start( ids ).subscribe ({
        next :(e) => {
					switch(e.type) {
						case Stg.STAGE_EVENT.START_TURN :
						  this.onTurnStart( e.data );
							break;
						case Stg.STAGE_EVENT.LIMIT_TIME_CHANGED:
							this.currentPlayer.limitTime = e.data;
							break;
						case Stg.STAGE_EVENT.TIME_CHANGED :
						  this.onTime( e.data );
							break;
						case Stg.STAGE_EVENT.NEXT_TURN :
							this.onTurnNext( e.data );
							break;
						case Stg.STAGE_EVENT.CURRENT_PLAYER_CHANGED :
							this.onCurrentPlayerChanged( e.data );
							break;
						case Stg.STAGE_EVENT.NEXT_ROUND :
							this.onNextRound();
							break;
					}
				},
        complete :() => { this.onShowDown(); }
      });
			this.onStart( ids );
			this.onTurnStart( this.stage.status );
    });
  }

  getGameStartAblePlayers():Array<String> {
		let start = this.deallerButton;
		let len = this.positions.length;
		let end = len + start;
		var posIdx = 0;
		let ids = [];
		for ( var i = start; i < end; ++i){
			let idx = i % len;
			let id = this.positions[ idx ];
			if( id != null ){
				let player = this.players[id];
				player.isDealler = false;
				let able = player.isPlayAble(this.stage.minBankroll, posIdx)
				if( able ){
					if(posIdx == 0){
						this.deallerButton = idx;
						player.isDealler = true;
					}
					posIdx ++;
					ids.push( id );
				}
			}
		}
		this.debuger.log(ids, 'getGameStartAblePlayers');
    return ids;
  }

  onReset(){
    this.stage.reset();
    this.dealler.reset();
    for (let id in this.players) this.players[id].reset();
  }

	onStartDisable (isRetry:boolean = false) {
		this.debuger.log('onStartDisable');
		this.isStart = false;
		for (let id in this.players) this.players[id].startDisable();
		if( isRetry ) this.start();
	}

  onStart( ids:Array<String> ) {
		ids.forEach( id => {
			let player = this.players[id];
      let hand = this.dealler.getHand();
      player.start( hand );
			this.onBatting(id, this.stage.ante);
      if( player.isBlind ) return;
      this.delegate.next( new Event( GAME_EVENT.PUSH, {id:id, value:hand}) );
    })
    this.debuger.log('onGameStart');
  }

  onTurnStart(status:Stg.Status){
    this.debuger.log('onGameTurnStart');
		switch(status) {
			case Stg.Status.Flop :
			  this.dealler.openFlop();
				break;
		  case Stg.Status.Turn :
			  this.dealler.openTurn();
				break;
		}
		this.stage.turnStart( );
  }
	onTime(t:number){
		this.currentPlayer.time = t;
		if( t == 1 && this.currentPlayer.currentBlindAction != -1 ) {
			let command = {
	      c: Cmd.CommandType.Action,
	      t: this.currentPlayer.currentBlindAction
	    };
			this.debuger.log('force action');
			this.action ( this.currentPlayer.id, command );
		}
	}

  onTurnNext( id:string ){
    let nextPlayer = this.players[ id ];
    if( !nextPlayer.isActionAble() ) {
      this.debuger.log('turn pass');
      this.stage.onTurnComplete();
      return;
    }
    this.debuger.log('turn next');
		this.stage.turnNext();
  }

	onNextRound(){
		this.debuger.log('onNextRound');
		this.stage.nextRound();
		var nextPlayer = 0;
		var playPlayer = 0;
		for (let id in this.players){
			let player = this.players[id];
			player.nextRound();
			if( player.isActionAble() ) playPlayer++;
			if( player.isNextAble() ) nextPlayer++;
		}
		if( playPlayer > 1){
			Rx.interval(NEXT_ROUND_TIME).pipe(take(1)).subscribe(e => {
				this.stage.nextCheck();
				this.debuger.log('onNextCheck');
			});
		}else{
			this.debuger.log('onNextComplete');
			this.stage.complete();
			if( nextPlayer > 1) this.onShowDown( true );
			else this.onShowDown( false );
		}
	}

  onCurrentPlayerChanged( id:string ) {
		if(this.currentPlayer != null) this.currentPlayer.setPassivePlayer();
		this.currentPlayer = this.players[ id ];
		let actions = this.stage.getActions();
		let call = this.stage.getCallBat();
    this.currentPlayer.setActivePlayer(actions, call, this.stage.minBat);
		this.debuger.log(this.currentPlayer.name,'onCurrentPlayerChanged');
  }

	onBatting(id:String, amount:number){
		this.players[ id ].batting(amount);
		this.stage.batting(id, amount);
	}

  action (id: string, command: Command) {
		let player = this.players[ id ];
		if( command.t == Action.JoinGame && player.isJoinGameAble()){ this.onJoinGame(id, command.d); return; }
		if( command.t == Action.BlindAction ){ player.blindGame(); return; }
    if( this.currentPlayer == null ) return;
    if( id != this.currentPlayer.id ) return;
		this.currentPlayer = null;
		if( command.t == Action.AllIn ) {
			command.d = player.bankroll;
			this.debuger.log(player.bankroll, 'allin');
		}
		player.action(command);
		this.onBatting( id, this.stage.action(command) );
		if( command.t == Action.AllIn ) player.mainPot = this.stage.getMainPot(id);
		this.stage.onTurnComplete();
  }

  onError() {
    this.debuger.log('onGameError');
    this.onComplete();
  }

	onShowDown( isOpen:boolean = true ) {
		this.debuger.log('onShowDown');
		if( isOpen ) {
			this.dealler.showDown();
			this.stage.showDown();
		}
    for (let id in this.players) {
			let player = this.players[id];
			if( isOpen ) player.showDown();
			if( !player.isConnected() ) this.leaveCompleted(id);
		}
		Rx.interval(WAIT_TIME).pipe(take(1)).subscribe( this.onComplete.bind(this) );
  }

	onComplete() {
		this.debuger.log('onGameComplete');
		this.stage.complete();
		this.start();
	}

  isJoinAble(userId:string):boolean {
		for (let id in this.players) {
			let player = this.players[id];
			if( player.userId == userId ) {
				let able = player.isRejoinAble();
				if(!able) this.debuger.log(player, 'exist player');
				return able;
			}
		}
    return true;
  }

  join(id:string, options:JoinOption) {
		if(this.players[ id ] == undefined) {
			this.players[ id ] = new Player(id, options);
    	this.playerNum ++;
		} else {
			this.players[ id ].reJoin();
		}
		this.debuger.log(this.playerNum, 'join player num');
  }

	onJoinGame(id:string , position:number){
		if( this.positions[ position ] != null ){
			this.debuger.log( position, 'position is not available');
			return;
		}

		this.positions[ position ] = id;
		this.players[ id ].joinGame(position, this.isStart);
		if( !this.isStart ) this.start();
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
		this.positions[ this.players[ id ].position ] = null;
    delete this.players[ id ];
  }

  getPlayerData (id: string): PlayerData {
     return this.players[ id ];
  }
}
