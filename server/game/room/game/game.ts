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


const WAIT_TIME:number = 3000;
const MIN_GAME_PLAYER:number = 2;

export const GAME_EVENT = Object.freeze ({
	PUSH: "push"
});


export default class Game extends Component {
  players: EntityMap< Player >;
  stage: Stage;
	maxPlayer:number;

  @nosync
  dealler: Dealler;
	@nosync
  delegate:Rx.Subject;
	@nosync
	currentPlayer:Player;
  @nosync
	endPlayerID:string;
  @nosync
	playerNum:number = 0;
  @nosync
	positions:Array;
	@nosync
	deallerButton:number = 0;

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
    Rx.interval(WAIT_TIME).pipe(take(1)).subscribe(e => {
			let ids = this.getGameStartAblePlayers( );
      if( ids.length < MIN_GAME_PLAYER ) {
        this.onStartDisable();
        return;
      }
      this.stage.start( ids ).subscribe ({
        next :(e) => {
					switch(e.type) {
						case Stg.STAGE_EVENT.TIME_CHANGED :
						  this.currentPlayer.time = e.data;
							break;
						case Stg.STAGE_EVENT.NEXT_TURN :
							this.onTurnNext( e.data );
							break;
						case Stg.STAGE_EVENT.COMPLETE_TURN :
						  this.onTurnStart( e.data );
							break;
						case Stg.STAGE_EVENT.CURRENT_PLAYER_CHANGED :
							this.onCurrentPlayerChanged( e.data );
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
		this.debuger.log(ids);
    return ids;
  }

  onReset(){
    this.stage.reset();
    this.dealler.reset();
    for (let id in this.players) this.players[id].reset();
  }

	onStartDisable () {
		this.debuger.log('onStartDisable');
		for (let id in this.players) this.players[id].startDisable();
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
		let burnCards = [];
		switch(status) {
			case Stg.Status.Flop :
			  burnCards = this.dealler.getFlop();
				break;
		  case Stg.Status.Turn :
			  burnCards = this.dealler.getTurn();
				break;
		}
		this.stage.turnStart( burnCards );
		this.endPlayerID = this.stage.currentID;
  }

  onTurnNext( id:string ){
    let nextPlayer = this.players[ id ];
    if( this.endPlayerID == id ) {
			this.debuger.log('turn complete');
			this.onNextRound();
      return;
    }
    if( !nextPlayer.isActionAble() ) {
      this.debuger.log('turn pass');
      this.stage.onTurnComplete();
      return;
    }
    this.debuger.log('turn next');
		this.stage.turnNext();
  }

	onNextRound(){
		this.stage.nextRound();
		for (let id in this.players) this.players[id].nextRound();
	}

  onCurrentPlayerChanged( id:string ) {
		if(this.currentPlayer != null) this.currentPlayer.setPassivePlayer();
		this.currentPlayer = this.players[ id ];
		let actions = this.stage.getActions();
    this.currentPlayer.setActivePlayer(actions, this.stage.turnBat, this.stage.minBat);
		this.debuger.log(this.currentPlayer,'onCurrentPlayerChanged');
  }

	onBatting(id:String, amount:number){
		if( this.players[ id ].batting(amount) ) {
			this.stage.batting(amount);
		} else {
			this.debuger.warn(this.players[ id ], 'batting leak');
		}
	}

  action (id: string, command: Command) {
		this.debuger.log(command, 'onAction');
		let player = this.players[ id ];

		if(command.t = Action.JoinGame && player.isJoinGameAble()){ this.onJoinGame(id, command.d); return; }
		if(command.t = Action.BlindAction){ player.blindAction(); return; }
    if( this.currentPlayer == null ) return;
    if( id != this.currentPlayer.id ) return;

		switch(command.t) {
    	case Action.Raise:
			case Action.Bat:
        this.onBatting(id, command.d);
				this.endPlayerID = id;
			  break;
			case Action.SmallBlind:
			  this.onBatting(id, this.stage.smallBlindBat);
				break;
			case Action.BigBlind:
			  this.onBatting(id, this.stage.bigBlindBat);
        this.endPlayerID = id;
        break;
      case Action.AllIn:
				this.onBatting(id, command.d);
				break;
			case Action.Check:
	    case Action.Call:
				this.onBatting(id, command.d);
				break;
    }
    player.action(command);
		this.stage.action(command);
  }

  onError() {
    this.debuger.log('onGameError');
    this.onComplete();
  }

	onShowDown() {
		this.debuger.log('onShowDown');
    for (let id in this.players) {
			let player = this.players[id];
			player.showDown();
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
		let isPlaying = this.stage.isStart();
		this.positions[ position ] = id;
		this.players[ id ].joinGame(position, isPlaying);
		if( !isPlaying ) this.start();
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
