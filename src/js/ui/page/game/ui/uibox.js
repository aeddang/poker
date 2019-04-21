import SyncPropsComponent from 'Component/syncpropscomponent';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import Card from '../card'
import Betting from './betting'
import { Status, PositionStatus, NetworkStatus } from  "../playerstatus";

export const UI_EVENT = Object.freeze ({
	FOLD: 1,
	SAMALL_BLIND: 2,
	BIG_BLIND: 3,
	CHECK: 4,
	CALL: 5,
  BET: 6,
	RAISE: 7,
	ALL_IN: 8,
	BLIND: 9
});

const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;

class UiBoxInfo {
  constructor() {
    this.reset();
    this.minBet = 0;
		this.bankroll = 0;
  }
  reset() {}
}

class UiBoxBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
	    <img id='${this.id}profileImg' class='profile-image'></img>
			<div id='${this.id}infoArea' class='info'>
				<p id='${this.id}name' class='name'></p>
				<p id='${this.id}bankroll' class='bankroll'></p>
				<p id='${this.id}positionStatus' class='position-status'></p>
				<p id='${this.id}status' class='status'></p>
				<p id='${this.id}gameBet' class='game-bet'></p>
			</div>
			<div id='${this.id}actionArea' class='action'>
				<p class='bet'>
					<span id='${this.id}checkBet' class='check-bet'></span>
					<span id='${this.id}minBet' class='min-bet'></span>
				</p>
				<button id='${this.id}btnBlind' class='btn-blind'>B</button>
	      <button id='${this.id}btnFold' class='btn-fold'>F</button>
	      <button id='${this.id}btnSmallBlind' class='btn-small-blind'>SB</button>
				<button id='${this.id}btnBigBlind' class='btn-big-blind'>BB</button>
				<button id='${this.id}btnCheck' class='btn-check'>CK</button>
				<button id='${this.id}btnCall' class='btn-call'>C</button>
				<button id='${this.id}btnBet' class='btn-bet'>BT</button>
				<button id='${this.id}btnRaise' class='btn-raise'>RA</button>
	      <button id='${this.id}btnAllIn' class='btn-all-in'>ALL</button>
				<div id='${this.id}bettingArea' class='betting'></div>
			</div>
			<div id='${this.id}handArea' class='hand'>
			  <p id='${this.id}handStatus' class='hand-status'></p>
			</div>
			<div id='${this.id}actionInfo' class='action-info'></div>
    `;
  }
}

export default class UiBox extends SyncPropsComponent {
  constructor() {
    super();
		this.debuger.tag = 'UiBox';
		this.info = new UiBoxInfo();
		this.betting = new Betting();
		this.cards = [];
  }

  remove() {
    super.remove();
		this.betting.remove();
		this.cards.forEach( c => c.remove() );
		this.betting = null;
		this.profileImg = null;
    this.name = null;
    this.bankroll = null;
		this.status = null;
		this.positionStatus = null;
    this.gameBet = null;
		this.checkBet = null;
		this.minBet = null;
		this.btnFold = null;
		this.btnSmallBlind = null;
		this.btnBigBlind = null;
		this.btnCheck = null;
		this.btnCall = null;
		this.btnBet = null;
		this.btnRaise = null;
		this.btnAllIn = null;
		this.handStatus = null;
		this.cards = null;
		this.handArea = null;
	  this.bettingArea = null;
		this.infoArea = null;
		this.actionArea = null;
		this.actionInfo = null;
  }

  getElementProvider() { return new UiBoxBody(this.body); }
  onCreate(elementProvider) {
		this.name = elementProvider.getElement('name');
		this.bankroll = elementProvider.getElement('bankroll');
		this.status = elementProvider.getElement('status');
		this.positionStatus = elementProvider.getElement('positionStatus');
		this.gameBet = elementProvider.getElement('gameBet');
		this.checkBet = elementProvider.getElement('checkBet');
		this.minBet = elementProvider.getElement('minBet');

		this.btnBlind = elementProvider.getElement('btnBlind');
    this.btnFold = elementProvider.getElement('btnFold');
		this.btnSmallBlind = elementProvider.getElement('btnSmallBlind');
		this.btnBigBlind = elementProvider.getElement('btnBigBlind');
		this.btnCheck = elementProvider.getElement('btnCheck');
		this.btnCall = elementProvider.getElement('btnCall');
		this.btnBet = elementProvider.getElement('btnBet');
		this.btnRaise = elementProvider.getElement('btnRaise');
		this.btnAllIn = elementProvider.getElement('btnAllIn');
		this.handArea = elementProvider.getElement('handArea');
		this.infoArea = elementProvider.getElement('infoArea');
		this.actionArea = elementProvider.getElement('actionArea');
		this.handStatus = elementProvider.getElement('handStatus');
		this.profileImg = elementProvider.getElement('profileImg');
		this.actionInfo = elementProvider.getElement('actionInfo');
		this.profileImg.src = "./static/resource/obj_alien1.png"
		for(var i=0; i<2; ++i) {
      let card = new Card().init( this.handArea, CARD_WIDTH, CARD_HEIGHT, i * ( CARD_WIDTH + 5), -30);
			card.visible = false;
			this.cards.push( card );
    }
		this.bettingArea = elementProvider.getElement('bettingArea');
		this.betting.init( this.bettingArea ).subscribe ( this.onBetEvent.bind(this) );
    //this.bettingArea.visible = false;
  }

	setupWatchs(){
		this.watchs = {
			name: value =>{
				this.name.innerHTML = value;
			},
			bankroll: value =>{
				this.info.bankroll = value;
				this.bankroll.innerHTML = '$' + value;
			},
			status: value =>{
				switch ( value ) {
					case Status.Wait:
						this.status.innerHTML = 'Wait'
						this.resetHand();
						break;
					case Status.Impossible:
						this.status.innerHTML = 'Impossible'
						break;
					case Status.Fold:
						this.status.innerHTML = 'Fold'
						break;
					case Status.Play:
						this.status.innerHTML = 'Play'
						break;
					case Status.AllIn:
						this.status.innerHTML = 'AllIn'
						break;
					case Status.ShowDown:
						this.status.innerHTML = 'ShowDown'
						break;
					case Status.Absence:
						this.status.innerHTML = 'Absence'
						break;
					case Status.WaitBigBlind:
						this.status.innerHTML = 'WaitBigBlind'
						break;
				}
			},
			positionStatus: value =>{
        switch ( value ) {
          case PositionStatus.DeallerButton:
            this.positionStatus.innerHTML = 'DB'
            break;
          case PositionStatus.BigBlind:
            this.positionStatus.innerHTML = 'BB'
            break;
          case PositionStatus.SmallBlind:
            this.positionStatus.innerHTML = 'SB'
            break;
          case PositionStatus.None:
            this.positionStatus.innerHTML = ''
            break;
        }
      },
			gameBet: value =>{
        this.gameBet.innerHTML = 'Bet $' + value;
      },
			checkBet: value =>{
        this.checkBet.innerHTML = 'Call-> $' + value;
      },
	    minBet: value =>{
				this.info.minBet = value;
        this.minBet.innerHTML = 'Bet-> $' + value;
      },
      isBlind: value =>{
				this.handStatus.innerHTML = value ? 'Blind' : '';
      },
      isWinner: value =>{
				this.resetHand();
				this.handStatus.innerHTML = value ? 'Win!!' : '';
      },
      time: value =>{
				if(value == 0) this.betting.passive();
      },
			actionBlind: value => { this.setActionButton( this.btnBlind,  value ) },
			actionFold: value => { this.setActionButton( this.btnFold,  value ) },
	    actionSmallBlind: value => { this.setActionButton( this.btnSmallBlind,  value ) },
	    actionBigBlind: value => { this.setActionButton( this.btnBigBlind,  value ) },
	    actionCheck: value => {
				this.checkBet.visible = value;
				this.setActionButton( this.btnCheck,  value ) },
	    actionCall: value => {
				this.checkBet.visible = value;
				this.setActionButton( this.btnCall,  value ) },
	    actionBet: value => {
				this.minBet.visible = value;
				this.setActionButton( this.btnBet,  value ) },
	    actionRaise: value => {
				this.minBet.visible = value;
				this.setActionButton( this.btnRaise,  value ) },
	    actionAllIn: value => { this.setActionButton( this.btnAllIn,  value ) },
    };
  }

	onBetEvent( e ){
		this.delegate.next( e );
	}

	pushHand(cardDatas){
		//this.debuger.log(cardDatas, 'pushHand');
		this.cards.forEach( (c, idx) => c.setData( cardDatas[idx], true ) );
	}

	resetHand(){
		this.cards.forEach( c => c.hidden( true ) );
	}

	setActionButton( btn , value ) {
		btn.visible = value ;
	}

  setupEvent() {
		this.attachEvent(this.btnBlind, "click", this.onBlind.bind(this));
		this.attachEvent(this.btnFold, "click", this.onFold.bind(this));
		this.attachEvent(this.btnSmallBlind, "click", this.onSmallBlind.bind(this));
		this.attachEvent(this.btnBigBlind, "click", this.onBigBlind.bind(this));
    this.attachEvent(this.btnCheck, "click", this.onCheck.bind(this));
		this.attachEvent(this.btnCall, "click", this.onCall.bind(this));
    this.attachEvent(this.btnBet, "click", this.onBetSelect.bind(this, UI_EVENT.BET));
		this.attachEvent(this.btnRaise, "click", this.onBetSelect.bind(this, UI_EVENT.RAISE));
    this.attachEvent(this.btnAllIn, "click", this.onAllIn.bind(this));
		this.attachEvent(this.bettingArea, "mouseleave", this.onBetCancel.bind(this));
  }

	onResize() {
    super.onResize();
  }
	onBetSelect(evtType) {
		this.betting.active(this.info.minBet, this.info.bankroll, evtType);
		let target = ( evtType == UI_EVENT.BET ) ? this.btnBet : this.btnRaise;
		let bounce = Util.convertRectFromDimension(target , true);
		this.bettingArea.x = bounce.x;
		this.bettingArea.y = 0;
	}
	onBetCancel() {
		this.betting.passive();
	}

	viewActionInfo(info){
		this.actionInfo.innerHTML = info;
    animationAndComplete(this.actionInfo, { opacity:1, scale:1 }, p => {
      animationWithDelay(this.actionInfo, { opacity:0, scale:1.5 }, 500)
    });
  }


	onBlind() { this.delegate.next(new ComponentEvent( UI_EVENT.BLIND )); }
  onFold() { this.delegate.next(new ComponentEvent( UI_EVENT.FOLD )); }
	onSmallBlind() { this.delegate.next(new ComponentEvent( UI_EVENT.SAMALL_BLIND )); }
	onBigBlind() { this.delegate.next(new ComponentEvent( UI_EVENT.BIG_BLIND )); }
  onCheck() { this.delegate.next(new ComponentEvent( UI_EVENT.CHECK )); }
	onCall() { this.delegate.next(new ComponentEvent( UI_EVENT.CALL )); }
  onAllIn() { this.delegate.next(new ComponentEvent( UI_EVENT.ALL_IN )); }
}
