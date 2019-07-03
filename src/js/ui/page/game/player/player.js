import SyncPropsComponent from 'Component/syncpropscomponent';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import { Action } from  "Util/command";
import { Status, PositionStatus, NetworkStatus } from  "../playerstatus";
import { animation, animationAndComplete, animationWithDelay } from 'Skeleton/animation';
import Card from '../card'
import * as Rx from 'rxjs'
import { take } from 'rxjs/operators'
import * as SoundFactory from 'Root/soundfactory';

class PlayerBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("player");
    cell.classList.add("player-position-wait");
    cell.innerHTML = `
      <div class='info-box'>
        <div id='${this.id}name' class='name'></div>
        <div id='${this.id}bankroll' class='bankroll'></div>
        <div id='${this.id}positionIcon' class='position-icon'></div>
        <div id='${this.id}timeRange' class='time-range'>
          <div id='${this.id}timeBar' class='time-bar'></div>
          <div id='${this.id}timeThumb' class='time-thumb'></div>
        </div>
      </div>
      <div id='${this.id}hands' class='hands'></div>
      <div id='${this.id}message' class='message'></div>
      `;

    this.body.appendChild(cell);
  }
}

const CARD_WIDTH = 23;
const CARD_HEIGHT = 35;
class PlayerInfo {
  constructor() {
    this.reset();
    this.finalWinPot = 0;
		this.finalBet = 0;
    this.me = false;
    this.limitTime = 0;
    this.time = 0
    this.position = -1;
    this.isShowDown = false;
  }
  reset() {}
}
export default class Player extends SyncPropsComponent {
  constructor() {
    super();
    this.debuger.tag = 'Player';
    this.info = new PlayerInfo();
    this.cards = null;
    this.rxMessage = null
  }

  init(body, itsMe) {
    this.info.me = itsMe;
    return super.init(body);
  }
  remove() {
    this.resetStatus();
    super.remove();
    this.removeCards();
    this.removeViewMessage()
    this.info = null;
    this.name = null;
    this.bankroll = null;
    this.timeRange = null;
    this.timeBar = null;
    this.timeThumb = null;
    this.positionIcon = null;
    this.hands = null;
    this.cards = null;
    this.message = null;
  }


  getElementProvider() { return new PlayerBody(this.body); }
  onCreate(elementProvider) {

    this.name = elementProvider.getElement('name');
    this.bankroll = elementProvider.getElement('bankroll');
    this.timeRange = elementProvider.getElement('timeRange');
    this.timeBar = elementProvider.getElement('timeBar');
    this.timeThumb = elementProvider.getElement('timeThumb');
    this.positionIcon = elementProvider.getElement('positionIcon');
    this.hands = elementProvider.getElement('hands');
    this.message = elementProvider.getElement('message');
    this.timeThumb.visible = false;
    this.hands.opacity = 0;
    this.message.opacity = 0;
  }

  setupWatchs(){
    this.watchs = {
      name: value =>{
        this.name.innerHTML = value;
      },
      position: value =>{
        this.info.position = value;
        if( value != -1 ) this.onGameJoin();
      },
      bankroll: value =>{
        this.debuger.log(value, "bankroll");
        this.bankroll.innerHTML = '$' + Util.numberWithCommas(value);
      },
      status: value =>{
        switch ( value ) {
          case Status.Wait:
            this.resetHand();
            this.removePlayerStatus();
            this.removeGameStatus();
            break;
          case Status.Impossible:
            this.addPlayerStatus("impossible");
            break;
          case Status.Fold:
            this.addPlayerStatus("fold");
            break;
          case Status.Play:
            this.setHand();
            this.addPlayerStatus("play");
            break;
          case Status.AllIn:
            this.addGameStatus("allin");
            break;
          case Status.ShowDown:
            this.addGameStatus("showdown");
            break;
          case Status.Absence:
          case Status.WaitBigBlind:
            this.removeGameStatus();
            this.addPlayerStatus("wait");
            break;

        }
      },
      gameBet: value =>{
        //this.bet.innerHTML = 'GameBet -> ' + value;
      },
      time: value =>{
        this.info.time = value;
        if(this.info.limitTime <= 0) return;
        let pct = Util.getStyleRatio( 100-(this.info.time/ this.info.limitTime * 100) );
        this.timeBar.style.width = pct;
        this.timeThumb.style.left = pct;
        if(this.info.limitTime > 5 && this.info.time <= 5) SoundFactory.getInstence().play( SoundFactory.STATIC_SOUND.TICK_TIME );
      },
      limitTime: value =>{
        this.info.limitTime = value;
      },
      isBlind: value =>{

      },
      isWinner: value =>{
        this.debuger.log(value, "isWinner");
        if(value == null || value == "") return;
        if(value) this.viewMessage( ("++ $" + this.info.finalWinPot) , "celebration");
      },
      winPot: value =>{
        this.debuger.log(value, "winPot");
        if(value == 0) return;
        this.info.finalWinPot = value;
      },

      isActive: value =>{
        if(value == true){
          this.timeThumb.visible = true;
          this.timeBar.style.width = 0;
          this.timeThumb.style.left = 0;
          this.addGameStatus("active");
        } else{
          this.timeThumb.visible = false;
          this.timeBar.style.width = 0;
          this.addGameStatus("passive");
        }
      },
      resultValue: value =>{
        var msg = "";
        var type = "alert";
        switch ( value ) {
          case Values.Highcard:
            msg = 'Highcard';
            break;
          case Values.Pair:
            msg = 'Pair';
            break;
          case Values.TwoPairs:
            msg = 'TwoPairs';
            break;
          case Values.ThreeOfAKind:
            msg = 'ThreeOfAKind';
            type = "celebration";
            break;
          case Values.Straight:
            msg = 'Straight';
            type = "celebration";
            break;
          case Values.FourOfAKind:
            msg = 'FourOfAKind';
            type = "celebration";
            break;
          case Values.Flush:
            msg = 'Flush';
            type = "celebration";
            break;
          case Values.FullHouse:
            msg = 'FullHouse';
            type = "celebration";
            break;
          case Values.StraightFlush:
            msg = 'StraightFlush';
            type = "celebration";
            break;
          case Values.RoyalStraightFlush:
            msg = 'RoyalStraightFlush';
            type = "celebration";
            break;
          default:
            return;
        }
        this.viewMessage(msg, "alert");
      },
      finalBet: value =>{
        this.info.finalBet = value;
      },
      finalAction: value =>{
        var msg = "";
        switch ( value ) {
          case Action.Fold:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.FOLD );
            msg = 'Fold';
            break;
          case Action.SmallBlind:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.CALL );
            msg = 'SmallBlind';
            break;
          case Action.BigBlind:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.BET );
            msg = 'BigBlind';
            break;
          case Action.Check:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.CALL );
            msg = 'Check';
            break;
          case Action.Call:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.CALL );
            msg = 'Call';
            break;
          case Action.Bet:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.BET );
            msg = 'Bet $' + this.info.finalBet;
            break;
          case Action.Raise:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.BET );
            msg = 'Raise';
            break;
          case Action.AllIn:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.ALL_IN );
            msg = 'AllIn';
            break;
          default:
            return;
        }
        this.viewMessage(msg, "action");
      },
      networkStatus: value =>{
        switch ( value ) {
          case NetworkStatus.Connected:
            this.addNetworkStatus("connect")
            break;
          case NetworkStatus.DisConnected:
            this.addNetworkStatus("disconnect")
            break;
          case NetworkStatus.Wait:
            this.addNetworkStatus("disconnect")
            break;
        }
      },

      positionStatus: value =>{
        switch ( value ) {
          case PositionStatus.DeallerButton:
            this.positionIcon.classList.add("db");
            this.positionIcon.visible = true;
            break;
          case PositionStatus.BigBlind:
            this.positionIcon.classList.add("bb");
            this.positionIcon.visible = true;
            break;
          case PositionStatus.SmallBlind:
            this.positionIcon.classList.add("sb");
            this.positionIcon.visible = true;
            break;
          case PositionStatus.None:
            this.positionIcon.classList.remove("db");
            this.positionIcon.classList.remove("sb");
            this.positionIcon.classList.remove("bb");
            this.positionIcon.visible = false;
            break;
        }
      }
    };
  }

  removeViewMessage(){
    this.message.classList.remove("celebration");
    this.message.classList.remove("alert");
    this.message.classList.remove("chat");
    this.message.classList.remove("action");
    if( this.rxMessage != null ) this.rxMessage.unsubscribe();
    this.rxMessage = null
  }
  viewMessage(msg, style = "action"){
    this.removeViewMessage()
    if(style != null) this.message.classList.add(style);
    this.message.innerHTML = msg;
    animation(this.message, { opacity:1, scale:1, top:-15 });
    this.rxMessage = Rx.interval(1500).pipe(take(1)).subscribe( {
      next :(t) => { animation(this.message, { opacity:0, scale:1.5, top:-30 }); },
      complete :() => { }
    })
  }

  getStatusBody(){
    var parent = this.getBody().parentNode;
    if(parent == null) return null;
    return parent.parentNode;
  }

  resetStatus(){
    this.removeGameStatus();
    this.removePlayerStatus();
    this.removeNetworkStatus();
  }

  setStatus(style = ""){
    let parent = this.getStatusBody();
    if(parent == null) return;
    parent.classList.add("position-"+style);
  }

  removeGameStatus(){
    let parent = this.getStatusBody();
    if(parent == null) return;
    parent.classList.remove("position-allin");
    parent.classList.remove("position-showdown");
    parent.classList.remove("position-active");
    parent.classList.remove("position-passive");
  }
  addGameStatus(style = ""){
    this.removeGameStatus();
    this.setStatus(style);
  }

  removePlayerStatus(){
    let parent = this.getStatusBody();
    if(parent == null) return;
    parent.classList.remove("position-wait");
    parent.classList.remove("position-fold");
    parent.classList.remove("position-play")
    parent.classList.remove("position-impossible")
  }
  addPlayerStatus(style = ""){
    this.removePlayerStatus();
    this.setStatus(style);
  }

  removeNetworkStatus(){
    let parent = this.getStatusBody();
    if(parent == null) return;
    parent.classList.remove("position-disconnect");
    parent.classList.remove("position-connect");
  }
  addNetworkStatus(style = ""){
    this.removeNetworkStatus();
    this.setStatus(style);
  }

  onChat(brodcast){
    this.viewMessage(brodcast.message, "chat");
  }

  onGameJoin( ) {
    this.getBody().classList.remove("player-position-wait");
    this.getBody().classList.add("player-position-join");
    let margin = 5;
    let len = 5;
    let bounce = Util.convertRectFromDimension(this.getBody().parentNode);
    if(bounce.width > 300){
      bounce.width = 193;
      bounce.height = 91;
    }
    this.debuger.log(bounce, 'bounce');
    var wid = ( bounce.width - ((len+1) * margin) ) / len;
    var hei = wid * 1.5;
    var tx = margin;
    var ty = (bounce.height - hei)/2;
    wid = Math.floor(wid);
    hei = Math.floor(hei);
    tx = Math.floor(tx);
    ty = Math.floor(ty);

  }

  setHand(){
    if(this.info.me) return;
    this.debuger.log(this.cards, 'setHand');
    if(this.cards != null) return;
    this.cards = [];

    for(var i=0; i<2; ++i) {
      let card = new Card().init( this.hands , CARD_WIDTH , CARD_HEIGHT, CARD_WIDTH * i , 0);
      this.cards.push( card );
    }
    animationAndComplete( this.hands,{ opacity:1, top: -CARD_HEIGHT },
		p => {
      this.cards.forEach( (c, idx) => animation(c.getBody(), { rotateZ: (15 - (30*idx)) + "deg" } ));
		});

	}

	resetHand(){
    animationAndComplete( this.hands,{ opacity:0, top: -CARD_HEIGHT + 10 },
		p => { this.removeCards(); });
	}

  removeCards(){
		if(this.cards == null) return;
		this.cards.forEach( c => c.remove() );
		this.cards = null;
	}
  
  openCard( idx, cardData ) {
    if(this.cards == null) return;
    let card = this.cards[ idx ];
    card.setData( cardData );
    card.burn();
  }

  showCard( idx, cardData ) {
    if(this.cards == null) return;
    let card = this.cards.find( c => { return (c.cardData.suit == cardData.suit && c.cardData.num == cardData.num) });
    if(card == undefined) return;
    card.show();
  }

  hideCard( id ) {

  }
}

const Values = Object.freeze ({
  Highcard: 1,
  Pair: 2,
  TwoPairs: 3,
  ThreeOfAKind: 4,
  Straight: 5,
  FourOfAKind: 6,
  Flush: 7,
  FullHouse: 8,
  StraightFlush: 9,
  RoyalStraightFlush: 10
});
