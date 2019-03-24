import { EntityMap, nosync } from "colyseus"
import Component from '../../skeleton/component'
import { JoinOption } from "../../util/interface"
import Command, * as Cmd from  "../../util/command"
import { Action, checkCommand } from  "../../util/command"
import * as Rx from 'rxjs'
import { take } from 'rxjs/operators'
import Event from  "../../util/event"

import Player  from  "./player"
import Stage, * as Stg from  "./stage"
import Dealler from  "./dealler"


const WAIT_TIME:number = 5000
const NEXT_ROUND_TIME:number = 3000
const SHOW_TIME:number = 2000
const REJOIN_PUSH_TIME:number = 200
const MIN_GAME_PLAYER:number = 2


const SUBSCRIPTION = Object.freeze ({
	START: "strat",
	STAGE: "stage",
	NEXT: "next",
	SHOW_DOWN: "showDown",
	COMPLETE: "complete",
	REJOIN_PUSH: "rejoinPush"
})

export const GAME_EVENT = Object.freeze ({
  PUSH: "push"
})


export default class Game extends Component {
  players: EntityMap< Player >
  stage: Stage
	maxPlayer:number
	dealler: Dealler

	@nosync
  delegate:Rx.Subject
	@nosync
	currentPlayer:Player
  @nosync
	playerNum:number = 0
  @nosync
	positions:Array
	@nosync
	deallerButton:number = 0
	@nosync
  isStart: boolean = false



	constructor(ante: number, gameRule:number, maxClients:number) {
		super()
		this.maxPlayer = maxClients
		this.players = {}
		this.positions = Array(maxClients)
    this.dealler = new Dealler()
    this.stage = new Stage(ante, gameRule)
    this.delegate = new Rx.Subject()
  }

  remove() {
    this.stage.remove()
		this.dealler.remove()
    this.delegate.complete()
    for (let id in this.players) this.players[id].remove()
    this.players = null
    this.currentPlayer = null
		this.dealler = null
    this.delegate = null
		super.remove()
  }

  start(delay){
		this.onReset()
    if(  this.playerNum < MIN_GAME_PLAYER ){
			this.onStartDisable()
			return
		}
    this.debuger.log('start')
		this.isStart = true
    this.disposable[ SUBSCRIPTION.START ] = Rx.interval(WAIT_TIME).pipe(take(1)).subscribe(e => {
			let ids = this.getGameStartAblePlayers( )
      if( ids.length < MIN_GAME_PLAYER ) {
        this.onStartDisable( true )
        return
      }
      this.disposable[ SUBSCRIPTION.STAGE ] = this.stage.start( ids ).subscribe ({
        next :(e) => {
					switch(e.type) {
						case Stg.STAGE_EVENT.START_TURN :
						  this.onTurnStart( e.data )
							break
						case Stg.STAGE_EVENT.LIMIT_TIME_CHANGED:
							this.currentPlayer.limitTime = e.data
							break
						case Stg.STAGE_EVENT.TIME_CHANGED :
						  this.onTime( e.data )
							break
						case Stg.STAGE_EVENT.NEXT_TURN :
							this.onTurnNext( e.data )
							break
						case Stg.STAGE_EVENT.CURRENT_PLAYER_CHANGED :
							this.onCurrentPlayerChanged( e.data )
							break
						case Stg.STAGE_EVENT.NEXT_ROUND :
							this.onNextRound()
							break
					}
				},
        complete :() => { this.onShowDown() }
      })
			this.onStart( ids )
			this.onTurnStart( this.stage.status )
    })

  }

  getGameStartAblePlayers():Array<String> {
		let start = this.deallerButton
		let len = this.positions.length
		let end = len + start
		var posIdx = 0
		let ids = []
		let isBigBlindCheck = this.playerNum > 3
		this.debuger.log(this.playerNum, 'isBigBlindCheck : ' + isBigBlindCheck)
		for ( var i = start; i < end; ++i){
			let idx = i % len
			let id = this.positions[ idx ]
			if( id != null ){
				let player = this.players[id]
				this.debuger.log(player.status, 'posIdx : ' + posIdx)
				let able = player.isPlayAble(this.stage.minBankroll, posIdx, isBigBlindCheck)
				if( able ){
					if(posIdx == 0){
						this.deallerButton = idx + 1
						player.isDealler = true
					}
					player.setPosition( posIdx )
					posIdx ++
					ids.push( id )
				}
			}
		}
		this.debuger.log(this.deallerButton, 'deallerButton')
		this.debuger.log(ids, 'getGameStartAblePlayers')
    return ids
  }

  onReset(){
    this.stage.reset()
    this.dealler.reset()
    for (let id in this.players) this.players[id].reset()
  }

	onStartDisable (isRetry:boolean = false) {
		this.debuger.log(isRetry, 'onStartDisable')
		this.isStart = false
		for (let id in this.players) this.players[id].startDisable()
		if( isRetry ) this.start()
	}

  onStart( ids:Array<String> ) {
		ids.forEach( id => {
			let player = this.players[id]
      let hand = this.dealler.getHand()
      player.start( hand )
			this.onBetting(id, this.stage.ante)
    	this.onPushHand( id )
    })
    this.debuger.log('onGameStart')
  }

  onTurnStart(status:Stg.Status){
    this.debuger.log('onGameTurnStart')
		switch(status) {
			case Stg.Status.Flop :
			  this.dealler.openFlop()
				break
		  case Stg.Status.Turn :
			  this.dealler.openTurn()
				break
		}
		this.stage.turnStart( )
  }
	onTime(t:number){
		this.currentPlayer.time = t
		if( t == 0 ) {
			if( this.currentPlayer.currentBlindAction != -1 ){
				let command = {
		      c: Cmd.CommandType.Action,
		      t: this.currentPlayer.currentBlindAction
		    }
				this.debuger.log('force action')
				this.action ( this.currentPlayer.id, command )
			}else{
				this.removeCurrentPlayer();
			}

		}
	}

	removeCurrentPlayer(){
		if(this.currentPlayer == null) return
		this.debuger.log(this.currentPlayer.name,'removeCurrentPlayer')
		this.currentPlayer.setPassivePlayer()
		this.currentPlayer = null
	}

	onCurrentPlayerChanged( id:string ) {
		//this.removeCurrentPlayer();
		this.currentPlayer = this.players[ id ]
		let actions = this.stage.getActions()
		this.debuger.log(actions,'CurrentPlayer actions')
		let call = this.stage.getCallBet()
    this.currentPlayer.setActivePlayer(actions, call, this.stage.minBet)
		this.debuger.log(this.currentPlayer.name,'onCurrentPlayerChanged')
  }

	action (id: string, command: Command) {
		let player = this.players[ id ]
		this.debuger.log(id, 'action')
		if( command.t == Action.JoinGame && player.isJoinGameAble()){ this.onJoinGame(id, command.d); return }
		if( command.t == Action.Blind ){ player.blindGame(); return }
    if( this.currentPlayer == null ) return
    if( id != this.currentPlayer.id ) return
		if( command.t == Action.AllIn ) {
			command.d = player.bankroll
			this.debuger.log(player.bankroll, 'allin')
		}
		player.action(command)
		this.onBetting( id, this.stage.action(command) )
		if( command.t == Action.AllIn ) player.mainPot = this.stage.getMainPot(id)
		this.removeCurrentPlayer();
		this.stage.onTurnComplete()

  }
	onBetting(id:String, amount:number){
		this.players[ id ].betting(amount)
		this.stage.betting(id, amount)
	}

  onTurnNext( id:string ){
    let nextPlayer = this.players[ id ]
		this.debuger.log(nextPlayer.status , 'onTurnNext')
    if( !nextPlayer.isActionAble() ) {
      this.debuger.log('turn pass')
      this.stage.onTurnComplete()
      return
    }
		var playPlayer = 0
		this.stage.ids.forEach( id => {
			let player = this.players[id]
			if( player.isActionAble() ) playPlayer++
		})
		if( playPlayer < 2 ) {
      this.debuger.log('all player pass')
      this.stage.onTurnComplete()
      return
    }

    this.debuger.log('turn next')
		this.stage.turnNext()
  }

	onNextRound(){
		this.debuger.log('onNextRound')
		this.stage.nextRound()
		var nextPlayer = 0
		var playPlayer = 0
		this.stage.ids.forEach( id => {
			let player = this.players[id]
			player.nextRound()
			if( player.isActionAble() ) playPlayer++
			if( player.isNextAble() ) nextPlayer++
		})
		if( playPlayer > 1){
			this.disposable[ SUBSCRIPTION.NEXT ] = Rx.interval(NEXT_ROUND_TIME).pipe(take(1)).subscribe(e => {
				this.debuger.log('onNextCheck')
				this.stage.nextCheck()
			})
		}else{
			this.debuger.log('onNextComplete')
			this.stage.complete()
			if( nextPlayer > 1) this.onShowDown( true )
			else this.onShowDown( false )
		}
	}

	onShowDown( isOpen:boolean = true ) {
		this.debuger.log('onShowDown')
		if( isOpen ) {
			this.dealler.showDown()
			this.stage.showDown()
		}
		let handsValues = []
		let showDownPlayers = this.stage.getShowDownPlayers()
    showDownPlayers.forEach ( id => {
			let player = this.players[id]
			if( player.isNextAble() ) {
				let value = this.dealler.getHandValue( player.hand )
				value.id = id
				handsValues.push( value )
			}
		})
		if( !isOpen ) {
			this.onShowDownComplete( handsValues )
			return
		}
		let len = handsValues.length
		this.disposable[ SUBSCRIPTION.SHOW_DOWN ] = Rx.interval(SHOW_TIME).pipe(take(len)).subscribe( {
      next :(t) => {
				this.players[ handsValues[ t ].id ].showDown(  handsValues[ t ] )
			},
      complete :() => { this.onShowDownComplete( handsValues ) }
    })

  }

	onShowDownComplete( handsValues ) {
		this.debuger.log('onShowDownComplete')
		this.onDivisionPots( handsValues )
    for (let id in this.players) {
			if( !this.players[id].isConnected() ) this.leaveCompleted(id)
		}
		this.disposable[ SUBSCRIPTION.COMPLETE ] = Rx.interval(WAIT_TIME).pipe(take(1)).subscribe( this.onComplete.bind(this) )
	}

	onDivisionPots( handsValues ){
		if( handsValues.length == 0 ) return;
		let results = this.dealler.sortHandValues( handsValues )
		let totalPot = this.stage.getSidePot()
		let len = results.length
		var idx = 0
		var isNext = true

		do {
			let winners = results[ idx ]
			let playWinners = []
			let wNum = winners.length
			winners.forEach( w =>{
				let player = this.players[ w.id ]
				var getPot = 0
				if ( player.mainPot == 0) {
					playWinners.push( player )
					getPot = Math.floor( totalPot / wNum )
					player.winPot += getPot
					isNext = false
					this.debuger.log( getPot , 'getPot ' + player.name )
				} else {
					getPot = this.stage.getMainPot( w.id )
					if( getPot > totalPot) getPot = totalPot;
					getPot = Math.floor( getPot / wNum )
					player.winPot += getPot
					this.debuger.log( getPot , 'getPot allin ' + player.name )
				}
				totalPot -= getPot
				if( totalPot <= 0 ) isNext = false
			})
			if( !isNext ) {
				var getPot = Math.floor( totalPot/ playWinners.length )
				playWinners.forEach( p => p.winPot += getPot )
				totalPot -= getPot
			}
			this.debuger.log( totalPot , 'totalPot' )
			idx ++
		} while ( isNext  && (idx < len) )

		handsValues.forEach( v => {
			this.players[ v.id ].updatePot()
		})

	}

	onComplete() {
		this.debuger.log('onGameComplete')
		this.currentPlayer = null
		this.stage.complete()
		this.start()
	}

  isJoinAble(options:JoinOption):boolean {
		let userId = options.userId;
		for (let id in this.players) {
			let player = this.players[id]
			if( player.userId == userId ) {
				let able = player.isRejoinAble()
				if(!able) this.debuger.log(player, 'exist player')
				else options.sessionId = id;
				return able
			}
		}
    return true
  }

	lazyPushHand( id ){
		this.disposable[ SUBSCRIPTION.REJOIN_PUSH ] = Rx.interval( REJOIN_PUSH_TIME ).pipe(take(1)).subscribe(e => {
			this.onPushHand( id )
		})
	}

	onPushHand( id ){
		let player = this.players[id]
		if( player.isBlind ) return
		if( player.hand == null ) return
		this.delegate.next( new Event( GAME_EVENT.PUSH, {id:id, value:player.hand}) )
	}

  join(id:string, options:JoinOption) {
		if(this.players[ id ] == undefined) {
			this.players[ id ] = new Player(id, options)
    	this.playerNum ++
		} else {
			this.players[ id ].reJoin()
		}
		this.debuger.log(this.playerNum, 'join player num')
  }

	onJoinGame(id:string , position:number){
		if( this.positions[ position ] != null ){
			this.debuger.log( position, 'position is not available')
			return
		}
		this.positions[ position ] = id
		this.players[ id ].joinGame(position, this.isStart)
		if( !this.isStart ) this.start()
	}

  waiting(id:string){
		this.debuger.log(id, 'waiting')
    this.players[ id ].waiting()
  }

	syncJoin(id:string, prevId:string){
		let prevPlayer = this.players[ prevId ]
    delete this.players[ prevId ]
		this.players[ id ] =  prevPlayer;
		this.debuger.log(this.players[ id ], 'syncJoin')
		prevPlayer.syncJoin( id )
		if ( prevPlayer.position == -1 ) return
		this.positions[ prevPlayer.position ] = id
		this.stage.syncJoin(id, prevId)
		if(this.currentPlayer != null && this.currentPlayer.id == prevId ) this.currentPlayer.id = id;
		this.lazyPushHand(id);
	}

  reJoin(id:string){
    this.players[ id ].reJoin()
		this.lazyPushHand(id);
  }

  leave(id:string): string {
		let player = this.players[ id ]
		if( player == null ) {
			this.debuger.log(id, 'rejoin player')
			return null
		}
    this.playerNum--
		this.debuger.log(this.playerNum, 'playerNum');
		let nick = player.name
    if( this.stage.hasPlayer( id ) ) {
			player.leave()
			this.debuger.log(player.name, 'leave')
			if( player.isFoldenAble() ) this.stage.onTurnComplete()
    } else {
      this.leaveCompleted(id)
    }
    return nick
  }

  leaveCompleted(id:string) {
		this.debuger.log( this.players[ id ].name, 'leaveComplete' )
		this.positions[ this.players[ id ].position ] = null
    delete this.players[ id ]
  }

  getPlayerData (id: string): PlayerData {
     return this.players[ id ]
  }
}
