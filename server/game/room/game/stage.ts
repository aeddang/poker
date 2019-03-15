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

  minBat:number = 0
  roundPot:number = 0
	gameBat:number = 0
	gamePot:number = 0

	@nosync
	time:number
	@nosync
	startPlayer:number
	@nosync
	playerBats:Array<number>
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
  didBat:boolean = false
	@nosync
  blindCount:number = 2
  @nosync
  smallBlindBat:number
  @nosync
  bigBlindBat:number
  @nosync
  minBankroll:number

	@nosync
  memoryCount:number = 0

  constructor(ante:number, gameRule:number) {
    super()
    this.ante = ante
    this.gameRule = gameRule
    this.smallBlindBat = ante * gameRule
    this.bigBlindBat = this.smallBlindBat * 2
    this.minBankroll = this.bigBlindBat + ante
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
		this.playerBats = null
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
		this.playerBats = null
		this.didBat = false
		this.gameBat = 0
		this.roundPot = 0
		this.gamePot = 0
		this.count = 0
  }

  start(ids:Array):Rx.Subject {
    this.ids = ids
		this.startPlayer = 0
		this.playerBats = ids.map( id => 0 )
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
    this.turnBat = 0
    this.didBat = false
    this.minBat = this.bigBlindBat
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

	batting(id:string, bat:number ){
		if( this.minBat < bat ) this.minBat = bat
		let idx = this.ids.indexOf(id)
		this.playerBats[ idx ] += bat
    this.gamePot += bat
		this.roundPot += bat
    this.debuger.log(id, 'bat id')
		this.debuger.log(this.playerBats[ idx ], 'totalBat changed')
  }

	action( command: Command ):number {
		var bat = 0
		var totalBat = this.playerBats[ this.turn ]
		switch(command.t) {
      case Action.Bat: this.didBat = true
			case Action.Raise: command.d = this.minBat * command.d
			case Action.AllIn: bat = command.d
				break
			case Action.SmallBlind:
				bat = this.smallBlindBat
				this.blindCount--
				break
			case Action.BigBlind:
				this.blindCount--
				bat = this.bigBlindBat
				break
      case Action.Fold: bat = 0; break
			default: bat = this.gameBat - totalBat; break
    }

		totalBat = bat + totalBat
		if( totalBat > this.gameBat ) {
			this.gameBat = totalBat
			this.debuger.log(this.gameBat, 'gameBat changed')
			this.startPlayer = this.turn
			this.debuger.log(this.startPlayer, 'startPlayer changed')
		}
		return bat
  }

  nextRound() {
    this.status ++
		this.blindCount = 1
		this.roundPot = 0
		this.gameBat = 0
		this.count = 0
		this.didBat = false
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

	getCallBat():number {
    return this.gameBat - this.playerBats[ this.turn ]
  }

	getMainPot(id:string):number {
		let idx = this.ids.indexOf(id)
		let myBat =  this.playerBats[ idx ]
		let sum = (a, b) => a + ( (b > myBat) ? myBat : b )
		let pot = this.playerBats.reduce(sum,0)
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
    if( !this.didBat ) return [ Action.Bat, Action.Check, Action.Fold ]
    return [ Action.Raise, Action.Call, Action.Fold ]
  }


}
