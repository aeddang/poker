import Command from "../../util/command"
import Component from '../../skeleton/component'
import { Action, checkCommand } from  "../../util/command"
import { JoinOption } from "../../util/interface"
import { nosync } from "colyseus"

export default class Player extends Component {

  bankroll:number = 1000
  userId:string
  name:string
  position:number = -1
  networkStatus:NetworkStatus =  NetworkStatus.DisConnected

  isBlind:boolean = false
  isWinner:boolean = false
  status:Status = Status.Absence
  positionStatus:PositionStatus = PositionStatus.None
  gameBat:number = 0
  checkBat:number = 0
  minBat:number = 0
  mainPot:number = 0
  winPot:number = 0
  time:number = 0
  limitTime:number = 0
  finalAction:number = -1;
  isActive:boolean = false
  openHand:EntityMap<Any> = {}

  actionBlind:boolean = false
  actionFold:boolean = false
  actionSmallBlind:boolean = false
  actionBigBlind:boolean = false
  actionCheck:boolean = false
  actionCall:boolean = false
  actionBat:boolean = false
  actionRaise:boolean = false
  actionAllIn:boolean = false

  @nosync
  currentBlindAction:number = -1
  @nosync
  id:string
  @nosync
  hand:Array
  @nosync
  isActionComplete:boolean = false


  constructor(id:stirng, options:JoinOption) {
    super()
    this.id = id
    this.name = options.name
    this.userId = options.userId
    this.networkStatus = NetworkStatus.Connected
  }

  remove() {
    super.remove()
    this.hand = null
    for (let id in this.openHand) delete this.openHand[id]
    this.openHand = null
  }

  isConnected():boolean {
    if(this.networkStatus == NetworkStatus.DisConnected) return false
    return true
  }

  waiting(){
    this.networkStatus = NetworkStatus.Wait
  }

  isJoinGameAble(){
    return this.status == Status.WaitBigBlind || this.status == Status.Absence
  }

  joinGame( position:number, isPlaying:boolean){
    this.position = position
    this.status = isPlaying ? Status.WaitBigBlind : Status.Wait
  }

  isRejoinAble():boolean {
    return this.networkStatus == NetworkStatus.Wait
  }

  reJoin(){
    this.networkStatus = NetworkStatus.Connected
  }

  syncJoin( changeId:string ){
    this.id = changeId
    this.reJoin()
	}

  leave(){
    this.networkStatus = NetworkStatus.DisConnected
    this.status = Status.Fold
  }

  isPlayAble(minBankroll:number, posIdx:int):boolean {
    if( this.networkStatus != NetworkStatus.Connected ) return false
    if( this.status == Status.Absence ) return false
    if( this.status == Status.WaitBigBlind && posIdx != 2 ) return false
    if( minBankroll > this.bankroll ) {
      this.status = Status.Impossible
      return false
    }
    return true
  }
  isActionAble():boolean {
    if( this.status == Status.Play ) return true
    return false
  }

  isNextAble():boolean {
    if( this.status == Status.Play ) return true
    if( this.status == Status.AllIn ) return true
    return false
  }

  isFoldenAble():boolean {
    if( this.currentBlindAction == -1  &&  this.isActive ) return true
    return false
  }

  startDisable () {
    if( this.status != Status.Absence) this.status = Status.Wait
  }

  reset(){
    this.hand = null
    if( this.status != Status.Absence & this.status != Status.WaitBigBlind ) this.status = Status.Wait
    this.isBlind = false
    this.isWinner = false
    this.time = 0
    this.mainPot = 0
    this.gameBat = 0
    this.checkBat = 0
    this.minBat = 0
    this.winPot = 0
    this.positionStatus = PositionStatus.None;
    this.currentBlindAction = -1
    this.finalAction = -1;
    this.actionBlind = true
    for (let id in this.openHand) delete this.openHand[id]
    this.resetAction()
  }

  resetAction() {
    this.actionFold = false
    this.actionSmallBlind = false
    this.actionBigBlind = false
    this.actionCheck = false
    this.actionCall = false
    this.actionBat = false
    this.actionRaise = false
    this.actionAllIn = false
  }

  start(hand:Array) {
    this.hand = hand
    this.actionBlind = false
    this.status = Status.Play
  }

  nextRound() {
    this.resetAction()
  }

  batting(amount:number):boolean{
    this.gameBat += amount
    this.bankroll -= amount
    return true
  }

  action (command: Command) {
    switch(command.t) {
      case Action.Fold: this.status = Status.Fold; break
      case Action.Raise: this.status = Status.Play; break
      case Action.Check: this.status = Status.Play; break
      case Action.Call: this.status = Status.Play; break
      case Action.Bat: this.status = Status.Play; break
      case Action.AllIn: this.status = Status.AllIn; break
      case Action.SmallBlind:
      case Action.BigBlind:
        if( this.networkStatus == NetworkStatus.Connected ) this.status = Status.Play
        break
    }
    this.finalAction = command.t
    this.time = 0
    this.resetAction()
    this.isActionComplete = true
  }

  showDown( cards:Array ){
    if(this.status == Status.Impossible || this.status == Status.Wait) return
    this.resetAction()
    this.status = Status.ShowDown
    cards.forEach( (c, idx) => this.openHand[ idx ] = c )
  }

  updatePot(){
    this.bankroll += this.winPot
    if( this.gameBat < this.winPot ){
      this.isWinner = true
      this.debuger.log(this.winPot,'win ' + this.name)
    } else if(this.gameBat > this.winPot) this.debuger.log(this.winPot,'lose ' + this.name)
    else this.debuger.log(this.winPot,'draw ' + this.name)
    this.winPot = 0
  }

  setPosition( idx:number ){
    switch( idx ){
      case 0: this.positionStatus = PositionStatus.DeallerButton; break
      case 1: this.positionStatus = PositionStatus.SmallBlind; break
      case 2: this.positionStatus = PositionStatus.BigBlind; break
      default: this.positionStatus = PositionStatus.None; break
    }
  }

  setActivePlayer(action:Array,call:number, minBat:number){
    this.isActive = true
    this.debuger.log(this.isActive ,'isActive')
    this.isActionComplete = false
    this.debuger.log(this.isActionAble(),'CurrentPlayer ' + this.status)
    if( !this.isActionAble() ) return;
    let bat = call + minBat
    let isBlindAc = false

    this.checkBat = call;
    this.minBat = minBat;
    let currentAction = action.map( ac => {
      switch(ac){
        case Action.Check:
        case Action.Call:
          if( call > this.bankroll) return Action.AllIn
          break
        case Action.SmallBlind:
        case Action.BigBlind: isBlindAc = true
        case Action.Bat:
        case Action.Raise:
          if( bat > this.bankroll) return Action.AllIn
          break
      }
      return ac
    })
    currentAction.forEach( ac => {
      switch(ac){
        case Action.Fold: this.actionFold = true; break
        case Action.SmallBlind: this.actionSmallBlind = true; break
        case Action.BigBlind: this.actionBigBlind = true; break
        case Action.Check: this.actionCheck = true; break
        case Action.Call: this.actionCall = true; break
        case Action.Bat: this.actionBat = true; break
        case Action.Raise: this.actionRaise = true; break
        case Action.AllIn: this.actionAllIn = true; break
      }
    })

    this.currentBlindAction = isBlindAc ? currentAction[0] : -1
  }

  setPassivePlayer(){
    this.checkBat = 0
    this.minBat = 0
    this.isActive = false
    this.debuger.log(this.isActive ,'isActive')
    this.time = 0
    this.limitTime = 0
    if( !this.isActionComplete ) this.status = Status.Fold
  }

  blindGame(){
    this.isBlind = !this.isBlind
  }
}

enum Status{
  Wait = 1,
  Impossible,
  Fold,
	Play,
  AllIn,
  ShowDown,
  Absence,
  WaitBigBlind
}

enum PositionStatus{
  None = 1,
  DeallerButton,
  SmallBlind,
  BigBlind
}

enum NetworkStatus{
  Connected = 1,
  DisConnected,
  Wait
}
