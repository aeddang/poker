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
import * as ImageFactory from 'Root/imagefactory';

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
        <img id='${this.id}positionIcon' class='position-icon'></img>
        <div id='${this.id}timeRange' class='time-range'>
          <div id='${this.id}timeBar' class='time-bar'></div>
          <div id='${this.id}timeThumb' class='time-thumb'></div>
        </div>
      </div>
      <div id='${this.id}hands' class='hands'></div>
      <div class='profile'>
        <img id='${this.id}profileBg' class='bg'></img>
        <img id='${this.id}profileImg' class='img'></img>
        <div id='${this.id}changeBank' class='change-bank'></div>
      </div>

      <div id='${this.id}message' class='message'></div>
      `;

    this.body.appendChild(cell);
  }
}

const CARD_WIDTH = 46;
const CARD_HEIGHT = 70;
class PlayerInfo {
  constructor() {
    this.reset();
		this.finalBet = 0;
    this.finalBank = 0;
    this.prevBank = -1;
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
    this.rxBank = null
  }

  init(body, itsMe) {
    this.info.me = itsMe;
    return super.init(body);
  }
  remove() {
    super.remove();
    this.removeCards();
    this.removeViewMessage();
    this.removeChangeBank();
    this.info = null;
    this.name = null;
    this.changeBank = null;
    this.bankroll = null;
    this.timeRange = null;
    this.timeBar = null;
    this.timeThumb = null;
    this.positionIcon = null;
    this.hands = null;
    this.cards = null;
    this.message = null;
    this.profileImg = null;
    this.profileBg = null;
  }


  getElementProvider() { return new PlayerBody(this.body); }
  onCreate(elementProvider) {
    this.profileImg = elementProvider.getElement('profileImg');
    this.profileBg = elementProvider.getElement('profileBg');
    this.name = elementProvider.getElement('name');
    this.bankroll = elementProvider.getElement('bankroll');
    this.timeRange = elementProvider.getElement('timeRange');
    this.timeBar = elementProvider.getElement('timeBar');
    this.timeThumb = elementProvider.getElement('timeThumb');
    this.positionIcon = elementProvider.getElement('positionIcon');
    this.hands = elementProvider.getElement('hands');
    this.changeBank = elementProvider.getElement('changeBank');
    this.message = elementProvider.getElement('message');
    this.timeThumb.visible = false;
    this.hands.opacity = 0;
    this.message.opacity = 0;
    this.changeBank.opacity = 0;
  }

  setupWatchs(){
    this.watchs = {
      name: value =>{
        this.name.innerHTML = value;
      },
      character: value =>{
        this.profileImg.src = ImageFactory.getMyCharacter(value);
      },
      position: value =>{
        this.info.position = value;
        if( value != -1 ) this.onGameJoin();
      },
      bankroll: value =>{
        this.info.finalBank = value;
        this.bankUpdate();
        this.viewChangeBank();
      },
      status: value =>{
        switch ( value ) {
          case Status.Wait:
            this.resetHand();
            this.bankUpdate();
            this.profileBg.src = ImageFactory.BgPlayerProfile.Default;
            break;
          case Status.Impossible:
            this.bankDisAbleUpdate("Bank Rack")
            this.profileBg.src = ImageFactory.BgPlayerProfile.Disable;
            break;
          case Status.Fold:
            this.bankDisAbleUpdate("Fold")
            this.profileBg.src = ImageFactory.BgPlayerProfile.Default;
            break;
          case Status.Play:
            this.setHand();
            this.profileBg.src = ImageFactory.BgPlayerProfile.Play;
            break;
          case Status.AllIn:
            this.bankDisAbleUpdate("All In");
            break;
          case Status.ShowDown:
            this.profileBg.src = ImageFactory.BgPlayerProfile.ShowDown;
            break;
          case Status.Absence:
          case Status.WaitBigBlind:
            this.profileBg.src = ImageFactory.BgPlayerProfile.Default;
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
        if(value == null || value == "") return;

      },
      winPot: value =>{
        if(value == 0) return;
        //if(value) this.viewMessage( ("$" + value) , "celebration");
      },

      isActive: value =>{
        if(value == true){
          this.timeThumb.visible = true;
          this.timeBar.style.width = 0;
          this.timeThumb.style.left = 0;
          this.profileBg.src = ImageFactory.BgPlayerProfile.Active;
        } else{
          this.timeThumb.visible = false;
          this.timeBar.style.width = 0;
          this.profileBg.src = ImageFactory.BgPlayerProfile.Play;
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
            this.profileBg.src = ImageFactory.BgPlayerProfile.Default;
            break;
          case NetworkStatus.DisConnected:
            this.profileBg.src = ImageFactory.BgPlayerProfile.Disable;
            break;
          case NetworkStatus.Wait:
            this.profileBg.src = ImageFactory.BgPlayerProfile.Disable;
            break;
        }
      },

      positionStatus: value =>{
        switch ( value ) {
          case PositionStatus.DeallerButton:
            this.positionIcon.src = ImageFactory.IconPosition.DeallerButton;
            this.positionIcon.visible = true;
            break;
          case PositionStatus.BigBlind:
            this.positionIcon.src = ImageFactory.IconPosition.BigBlind;
            this.positionIcon.visible = true;
            break;
          case PositionStatus.SmallBlind:
            this.positionIcon.src = ImageFactory.IconPosition.SmallBlind;
            this.positionIcon.visible = true;
            break;
          case PositionStatus.None:
            this.positionIcon.visible = false;
            break;
        }
      }
    };
  }



  bankUpdate(){
    this.bankroll.classList.remove("off");
    this.bankroll.innerHTML = '$' + Util.numberWithCommas(this.info.finalBank);
  }

  bankDisAbleUpdate(status){
    this.bankroll.classList.add("off");
    this.bankroll.innerHTML = status;
  }

  removeViewMessage(){
    this.message.classList.remove("celebration");
    this.message.classList.remove("alert");
    this.message.classList.remove("chat");
    this.message.classList.remove("action");
    if( this.rxMessage != null ) this.rxMessage.unsubscribe();
    this.rxMessage = null
  }
  removeChangeBank(){
    this.changeBank.classList.remove("increase");
    if( this.rxBank != null ) this.rxBank.unsubscribe();
    this.rxBank = null
  }
  viewMessage(msg, style = "action"){
    this.removeViewMessage()
    if(style != null) this.message.classList.add(style);
    this.message.innerHTML = msg;
    animation(this.message, { opacity:1, scale:1 });
    this.rxMessage = Rx.interval(1500).pipe(take(1)).subscribe( {
      next :(t) => { animation(this.message, { opacity:0, scale:1.5 }); },
      complete :() => { }
    })
  }

  viewChangeBank(){
    if(this.info.prevBank == -1) {
      this.info.prevBank = this.info.finalBank;
      return;
    }
    let changed = this.info.finalBank - this.info.prevBank;
    this.info.prevBank = this.info.finalBank;
    if(changed == 0) return;
    this.removeChangeBank();
    if(changed>0){
      changed = "+" + changed;
      this.changeBank.classList.add("increase");
    }

    this.changeBank.innerHTML = changed;

    animation(this.changeBank, { opacity:1, scale:1 });
    this.rxBank = Rx.interval(1500).pipe(take(1)).subscribe( {
      next :(t) => { animation(this.changeBank, { opacity:0, scale:1.5}); },
      complete :() => { }
    })
  }

  onChat(brodcast){
    this.viewMessage(brodcast.originMessage, "default");
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
