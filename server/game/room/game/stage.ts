import * as Rx from 'rxjs'
import { take } from 'rxjs/operators'
import { nosync } from "colyseus"
import { Action } from  "../../util/command"
import Component from '../../skeleton/component'
import Event from  "../../util/event"

const GAME_SPEED:number = 1000
const LIMIT_TIME:number = 30
const BLIND_LIMIT_TIME:number = 5

export const STAGE_EVENT = Object.freeze ({
	START_TURN: "startTurn",
	TIME_CHANGED: "timeChanged",
	LIMIT_TIME_CHANGED: "limitTimeChanged",
	NEXT_TURN: "nextTurn",
  CURRENT_PLAYER_CHANGED: "currentPlayerChanged",
	NEXT_ROUND: "nextRound"
})

const SUBSCRIPTION = Object.freeze ({
	TURN: "turn"
})

export enum Status{
  Wait = 1,
  FreeFlop,
  Flop,
  Turn,
  ShowDown
}


export default class Stage extends Component {
  ante:number = 1
  gameRule:number = 2
  isLimited:boolean = false
  status:Status = Status.Wait

  minBet:number = 0
  roundPot:number = 0
	gameBet:number = 0
	gamePot:number = 0

	@nosync
	time:number
	@nosync
	startPlayer:number
	@nosync
	playerBets:Array<number>
  @nosync
  turn:number
	@nosync
  count:number
  @nosync
  ids:Array<String>
  @nosync
  dellerID:string
  @nosync
  delegate:Rx.Subject
  @nosync
  gameScheduler:Rx.Observable

  @nosync
  didBet:boolean = false
	@nosync
  blindCount:number = 2
  @nosync
  smallBlindBet:number
  @nosync
  bigBlindBet:number
  @nosync
  minBankroll:number

	@nosync
  memoryCount:number = 0

  constructor(ante:number, gameRule:number) {
    super()
    this.ante = ante
    this.gameRule = gameRule
    this.smallBlindBet = ante * gameRule
    this.bigBlindBet = this.smallBlindBet * 2
    this.minBankroll = this.bigBlindBet + ante
    this.status = Status.Wait
    this.turn = 0
    this.time = 0
    this.delegate = null
    this.gameScheduler = Rx.interval(GAME_SPEED)
  }

  remove() {
    super.remove()
		this.delegate = null
    this.gameScheduler = null
    this.ids = null
    this.positions = null
		this.playerBets = null
  }

  hasPlayer( id:string ):boolean {
    if( this.ids == null ) return false
    if( this.ids.indexOf( id ) == -1 ) return false
    return true
  }

  reset(){
  	this.turn = 0
    this.time = 0
    this.status = Status.Wait
    this.ids = null
		this.playerBets = null
		this.didBet = false
		this.gameBet = 0
		this.roundPot = 0
		this.gamePot = 0
		this.count = 0
  }

  start(ids:Array):Rx.Subject {
    this.ids = ids
		this.startPlayer = 0
		this.playerBets = ids.map( id => 0 )
    this.delegate = new Rx.Subject()
    this.status = Status.FreeFlop
		this.blindCount = 2;
    return this.delegate
  }

	syncJoin(id:string, prevId:string){
		if( this.ids == null ) return;
		let idx = this.ids.findIndex( id => id == prevId )
		if( idx != -1 ) this.ids[ idx ] = id
	}

  turnStart() {
    this.turnBet = 0
    this.didBet = false
    this.minBet = this.bigBlindBet
		this.count = 1
		this.startPlayer = 0
		this.onTurnChange(1)
		this.turnNext()
  }

  turnNext() {
		this.memoryCount ++
		this.debuger.log(this.memoryCount, 'turnNext')
    this.time = ( this.count == 1  || ( this.count == 2 && this.status == Status.FreeFlop )) ? BLIND_LIMIT_TIME : LIMIT_TIME
		this.delegate.next( new Event( STAGE_EVENT.LIMIT_TIME_CHANGED , this.time ) )
    this.disposable[ SUBSCRIPTION.TURN ] = this.gameScheduler.pipe(take(LIMIT_TIME)).subscribe( {
      next :(t) => { this.onTime() },
      complete :() => { this.onTurnComplete() }
    })
  }

  onTime(){
    this.time--
		this.delegate.next( new Event( STAGE_EVENT.TIME_CHANGED , this.time ) )
  }

  onTurnComplete() {
		this.debuger.log('onTurnComplete')
		this.disposable[ SUBSCRIPTION.TURN ].unsubscribe()
		this.count ++
    let nextTurn = (this.turn + 1) % this.ids.length
		if( this.startPlayer == nextTurn ) {
			this.debuger.log("nextround", 'onTurnComplete')
			this.delegate.next( new Event( STAGE_EVENT.NEXT_ROUND))
		}
		else {
			let currentId = this.onTurnChange(nextTurn)
			this.debuger.log("nextturn", 'onTurnComplete')
			this.delegate.next( new Event( STAGE_EVENT.NEXT_TURN , currentId ) )
		}
  }

	onTurnChange(turn:number):string {
    this.turn = turn % this.ids.length
		let id =  this.ids[this.turn]
		this.debuger.log(this.startPlayer, 'onTurnChange')
		if( this.startPlayer != this.turn ) this.delegate.next( new Event( STAGE_EVENT.CURRENT_PLAYER_CHANGED , id) )
    return id
  }

	betting(id:string, bet:number ){
		if( this.minBet < bet ) this.minBet = bet
		let idx = this.ids.indexOf(id)
		this.playerBets[ idx ] += bet
    this.gamePot += bet
		this.roundPot += bet
    this.debuger.log(id, 'bet id')
		this.debuger.log(this.playerBets[ idx ], 'totalBet changed')
  }

	action( command: Command ):number {
		var bet = 0
		var totalBet = this.playerBets[ this.turn ]
		switch(command.t) {
      case Action.Bet: this.didBet = true
			case Action.Raise:
			case Action.AllIn: bet = command.d
				break
			case Action.SmallBlind:
				bet = this.smallBlindBet
				this.blindCount--
				break
			case Action.BigBlind:
				this.blindCount--
				bet = this.bigBlindBet
				break
      case Action.Fold: bet = 0; break
			default: bet = this.gameBet - totalBet; break
    }

		totalBet = bet + totalBet
		if( totalBet > this.gameBet ) {
			this.gameBet = totalBet
			this.debuger.log(this.gameBet, 'gameBet changed')
			this.startPlayer = this.turn
			this.debuger.log(this.startPlayer, 'startPlayer changed')
		}
		return bet
  }

  nextRound() {
    this.status ++
		this.blindCount = 1
		this.roundPot = 0
		this.count = 0
		this.didBet = false
  }

	nextCheck() {
		this.debuger.log(this.status, 'nextCheck')
    if(this.status == Status.ShowDown) {
			this.delegate.complete()
			this.debuger.log(this.status, 'complete')
		}
    else {
			this.delegate.next( new Event( STAGE_EVENT.START_TURN , this.status ) )
			this.debuger.log(this.status, 'next')
		}
  }

	showDown( ){
		this.status = Status.ShowDown
  }


  complete(){
		this.disposable[ SUBSCRIPTION.TURN ].unsubscribe()
    this.delegate = null
  }

	getCallBet():number {
    return this.gameBet - this.playerBets[ this.turn ]
  }

	getMainPot(id:string):number {
		let idx = this.ids.indexOf(id)
		let myBet =  this.playerBets[ idx ]
		let sum = (a, b) => a + ( (b > myBet) ? myBet : b )
		let pot = this.playerBets.reduce(sum,0)
    return pot
  }

	getShowDownPlayers():Array<String> {
		let len = this.ids.length
		let players = []
		for ( var i = 0; i < len; ++i ){
			let idx = (this.startPlayer + i) % len
			players.push( this.ids[idx] )
		}
    return players
  }

	getSidePot():number {
    return this.gamePot
  }

  getActions():Array{
		if( this.blindCount == 2 ) return [ Action.SmallBlind ]
    if( this.blindCount == 1 ) return [ Action.BigBlind ]
    if( !this.didBet ) return [ Action.Bet, Action.Check, Action.Fold ]
    return [ Action.Raise, Action.Call, Action.Fold ]
  }


}
