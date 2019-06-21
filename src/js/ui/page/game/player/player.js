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
        <div id='${this.id}positionIcon' class='position-icon db'></div>
        <div class='time-range'>
          <div id='${this.id}timeBar' class='time-bar'></div>
          <div id='${this.id}timeThumb' class='time-thumb'></div>
        </div>
      </div>`;

    this.body.appendChild(cell);
  }
}



export default class Player extends SyncPropsComponent {
  constructor() {
    super();
    this.debuger.tag = 'Player';
    this.me = false;
    this.limitTime = 0;
    this.time = 0
    this.isShowDown = false;
    this.cards = [];
    this.rxViewAction = null
  }

  init(body, itsMe) {
    this.me = itsMe;
    return super.init(body);
  }
  remove() {
    super.remove();
    this.cards.forEach( c => c.remove() );
    this.name = null;
    this.bankroll = null;
    this.timeBar = null;
    this.timeThumb = null;
    this.positionIcon = null
    this.cards = null;
  }


  getElementProvider() { return new PlayerBody(this.body); }
  onCreate(elementProvider) {

    this.name = elementProvider.getElement('name');
    this.bankroll = elementProvider.getElement('bankroll');
    this.timeBar = elementProvider.getElement('timeBar');
    this.timeThumb = elementProvider.getElement('timeThumb');
    this.positionIcon = elementProvider.getElement('positionIcon');
  }

  setupWatchs(){
    this.watchs = {
      name: value =>{
        this.name.innerHTML = value;
      },
      position: value =>{
        if( value != -1 ) this.onGameJoin();
      },
      bankroll: value =>{
        this.bankroll.innerHTML = '$' + value;
      },
      status: value =>{
        switch ( value ) {
          case Status.Wait:
            break;
          case Status.Impossible:
            break;
          case Status.Fold:
            break;
          case Status.Play:
            break;
          case Status.AllIn:
            break;
          case Status.ShowDown:
            break;
          case Status.Absence:
            break;
          case Status.WaitBigBlind:
            break;
        }
      },
      gameBet: value =>{
        //this.bet.innerHTML = 'GameBet -> ' + value;
      },
      time: value =>{
        this.time = value;
        if(this.limitTime <= 0) return;
        let pct = Util.getStyleRatio( this.time/ this.limitTime * 100 );
        this.timeBar.style.width = pct;
        this.timeThumb.style.left = pct;
        if(this.limitTime > 5 && this.time <= 5) SoundFactory.getInstence().play( SoundFactory.STATIC_SOUND.TICK_TIME );
      },
      limitTime: value =>{
        this.limitTime = value;
      },
      isBlind: value =>{

      },
      isWinner: value =>{
        if(value == null || value == "") return;

      },

      isActive: value =>{
        value ? this.getBody().classList.add("player-active") : this.getBody().classList.remove("player-active")
      },
      resultValue: value =>{
        switch ( value ) {
          case Values.Highcard:
            //this.resultValue.innerHTML = 'Highcard';
            break;
          case Values.Pair:
            //this.resultValue.innerHTML = 'Pair';
            break;
          case Values.TwoPairs:
            //this.resultValue.innerHTML = 'TwoPairs';
            break;
          case Values.ThreeOfAKind:
            //this.resultValue.innerHTML = 'ThreeOfAKind';
            break;
          case Values.Straight:
            //this.resultValue.innerHTML = 'Straight';
            break;
          case Values.FourOfAKind:
            //this.resultValue.innerHTML = 'FourOfAKind';
            break;
          case Values.Flush:
            //this.resultValue.innerHTML = 'Flush';
            break;
          case Values.FullHouse:
            //this.resultValue.innerHTML = 'FullHouse';
            break;
          case Values.StraightFlush:
            //this.resultValue.innerHTML = 'StraightFlush';
            break;
          case Values.RoyalStraightFlush:
            //this.resultValue.innerHTML = 'RoyalStraightFlush';
            break;
          default:
            //this.resultValue.innerHTML = '';
            return;
        }
      },

      finalAction: value =>{
        switch ( value ) {
          case Action.Fold:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.FOLD );
            //this.action.innerHTML = 'Fold'
            break;
          case Action.SmallBlind:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.CALL );
            //this.action.innerHTML = 'SmallBlind'
            break;
          case Action.BigBlind:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.BET );
            //this.action.innerHTML = 'BigBlind'
            break;
          case Action.Check:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.CALL );
            //this.action.innerHTML = 'Check'
            break;
          case Action.Call:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.CALL );
            //this.action.innerHTML = 'Call'
            break;
          case Action.Bet:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.BET );
            //this.action.innerHTML = 'Bet'
            break;
          case Action.Raise:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.BET );
            //this.action.innerHTML = 'Raise'
            break;
          case Action.AllIn:
            SoundFactory.getInstence().playEffect( SoundFactory.SOUND.ALL_IN );
            //this.action.innerHTML = 'AllIn'
            break;
          default:
            return;
        }
        this.viewAction();
      },
      networkStatus: value =>{
        switch ( value ) {
          case NetworkStatus.Connected:

            break;
          case NetworkStatus.DisConnected:

            break;
          case NetworkStatus.Wait:

            break;
        }
      },

      positionIcon: value =>{
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
  /*
  removeViewAction(){
    if( this.rxViewAction != null ) this.rxViewAction.unsubscribe();
    this.rxViewAction = null
  }
  viewAction(){
    if( this.rxViewAction != null ) this.rxViewAction.unsubscribe();
    animation(this.action, { opacity:1, scale:1 });
    this.rxViewAction = Rx.interval(1500).pipe(take(1)).subscribe( {
      next :(t) => { animation(this.action, { opacity:0, scale:1.5 }); },
      complete :() => { }
    })
  }
  */
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
    /*
    for(var i=0; i<len; ++i) {
      let card = new Card().init( this.showDown, wid, hei, tx ,ty);
      this.cards.push( card );
      card.visible = false;
      tx += (wid+margin)
    }
    */
  }

  showCard( id, cardData ) {
    /*
    let idx = Number(id);
    let card = this.cards[ idx ];
    card.setData( cardData, true );
    card.burn();
    if(this.isShowDown) return;
    this.isShowDown = true;
    SoundFactory.getInstence().playSideEffect( SoundFactory.SUB_SOUND.FLIP_CARD );
    animation(this.showDown, { opacity:1 });
    */
  }

  hideCard( id ) {
    /*
    let idx = Number(id);
    let card = this.cards[ idx ];
    card.hidden( true );
    if(!this.isShowDown) return;
    this.isShowDown = false;
    animation(this.showDown, { opacity:0});
    */
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
