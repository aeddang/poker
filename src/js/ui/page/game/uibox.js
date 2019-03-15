import SyncPropsComponent from 'Component/syncpropscomponent';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import Card from './card'
import { Status, PositionStatus, NetworkStatus } from  "./playerstatus";

export const UI_EVENT = Object.freeze ({
	FOLD: 1,
	SAMALL_BLIND: 2,
	BIG_BLIND: 3,
	CHECK: 4,
	CALL: 5,
  BAT: 6,
	RAISE: 7,
	ALL_IN: 8,
	BLIND: 9
});

const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;

class UiBoxBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
			<div id='${this.id}infoArea' class='info'>
				<p id='${this.id}name' class='name'></p>
				<p id='${this.id}bankroll' class='bankroll'></p>
				<p id='${this.id}positionStatus' class='position-status'></p>
				<p id='${this.id}status' class='status'></p>
				<p id='${this.id}gameBat' class='game-bat'></p>

			</div>
			<div id='${this.id}actionArea' class='action'>
				<p class='bat'>
					<span id='${this.id}checkBat' class='check-bat'></span>
					<span id='${this.id}minBat' class='min-bat'></span>
				</p>
				<button id='${this.id}btnBlind' class='btn-blind'>B</button>
	      <button id='${this.id}btnFold' class='btn-fold'>F</button>
	      <button id='${this.id}btnSmallBlind' class='btn-small-blind'>SB</button>
				<button id='${this.id}btnBigBlind' class='btn-big-blind'>BB</button>
				<button id='${this.id}btnCheck' class='btn-check'>CK</button>
				<button id='${this.id}btnCall' class='btn-call'>C</button>
				<button id='${this.id}btnBat' class='btn-bat'>BT</button>
				<button id='${this.id}btnRaise' class='btn-raise'>RA</button>
	      <button id='${this.id}btnAllIn' class='btn-all-in'>ALL</button>
			</div>
			<div id='${this.id}handArea' class='hand'>
			  <p id='${this.id}handStatus' class='hand-status'></p>
			</div>
    `;
  }
}

export default class UiBox extends SyncPropsComponent {
  constructor() {
    super();
		this.debuger.tag = 'UiBox';
		this.cards = [];
  }

  remove() {
    super.remove();
		this.cards.forEach( c => c.remove() );
    this.name = null;
    this.bankroll = null;
		this.status = null;
		this.positionStatus = null;
    this.gameBat = null;
		this.checkBat = null;
		this.minBat = null;
		this.btnFold = null;
		this.btnSmallBlind = null;
		this.btnBigBlind = null;
		this.btnCheck = null;
		this.btnCall = null;
		this.btnBat = null;
		this.btnRaise = null;
		this.btnAllIn = null;
		this.handStatus = null;
		this.cards = null;
		this.handArea = null;
		this.infoArea = null;
		this.actionArea = null;
  }

  getElementProvider() { return new UiBoxBody(this.body); }
  onCreate(elementProvider) {
		this.name = elementProvider.getElement('name');
		this.bankroll = elementProvider.getElement('bankroll');
		this.status = elementProvider.getElement('status');
		this.positionStatus = elementProvider.getElement('positionStatus');
		this.gameBat = elementProvider.getElement('gameBat');
		this.checkBat = elementProvider.getElement('checkBat');
		this.minBat = elementProvider.getElement('minBat');

		this.btnBlind = elementProvider.getElement('btnBlind');
    this.btnFold = elementProvider.getElement('btnFold');
		this.btnSmallBlind = elementProvider.getElement('btnSmallBlind');
		this.btnBigBlind = elementProvider.getElement('btnBigBlind');
		this.btnCheck = elementProvider.getElement('btnCheck');
		this.btnCall = elementProvider.getElement('btnCall');
		this.btnBat = elementProvider.getElement('btnBat');
		this.btnRaise = elementProvider.getElement('btnRaise');
		this.btnAllIn = elementProvider.getElement('btnAllIn');
		this.handArea = elementProvider.getElement('handArea');
		this.infoArea = elementProvider.getElement('infoArea');
		this.actionArea = elementProvider.getElement('actionArea');
		this.handStatus = elementProvider.getElement('handStatus');
		for(var i=0; i<2; ++i) {
      let card = new Card().init( this.handArea, CARD_WIDTH, CARD_HEIGHT, i * ( CARD_WIDTH + 5), -30);
			card.visible = false;
			this.cards.push( card );
    }

  }

	setupWatchs(){
		this.watchs = {
			name: value =>{
				this.name.innerHTML = value;
			},
			bankroll: value =>{
				this.bankroll.innerHTML = 'Bankroll -> ' + value;
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
			gameBat: value =>{
        this.gameBat.innerHTML = 'GameBat -> ' + value;
      },
			checkBat: value =>{
        this.checkBat.innerHTML = 'Call -> ' + value;
      },
	    minBat: value =>{
        this.minBat.innerHTML = 'Bat -> ' + value;
      },
      isBlind: value =>{
				this.handStatus.innerHTML = value ? 'Blind Action' : '';
      },
      isWinner: value =>{
				this.resetHand();
				this.handStatus.innerHTML = value ? 'Win!!' : '';
      },
      time: value =>{
        //this.debuger.log(value, 'time');
      },
			actionBlind: value => { this.setActionButton( this.btnBlind,  value ) },
			actionFold: value => { this.setActionButton( this.btnFold,  value ) },
	    actionSmallBlind: value => { this.setActionButton( this.btnSmallBlind,  value ) },
	    actionBigBlind: value => { this.setActionButton( this.btnBigBlind,  value ) },
	    actionCheck: value => {
				this.checkBat.visible = value;
				this.setActionButton( this.btnCheck,  value ) },
	    actionCall: value => {
				this.checkBat.visible = value;
				this.setActionButton( this.btnCall,  value ) },
	    actionBat: value => {
				this.minBat.visible = value;
				this.setActionButton( this.btnBat,  value ) },
	    actionRaise: value => {
				this.minBat.visible = value;
				this.setActionButton( this.btnRaise,  value ) },
	    actionAllIn: value => { this.setActionButton( this.btnAllIn,  value ) },
    };
  }

	pushHand(cardDatas){
		this.debuger.log(cardDatas, 'pushHand');
		this.cards.forEach( (c, idx) => c.burn( cardDatas[idx] ) );
	}

	resetHand(){
		this.cards.forEach( c => c.hidden( false ) );
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
    this.attachEvent(this.btnBat, "click", this.onBat.bind(this));
		this.attachEvent(this.btnRaise, "click", this.onRaise.bind(this));
    this.attachEvent(this.btnAllIn, "click", this.onAllIn.bind(this));
  }

	onResize() {
    super.onResize();
		let bounce = Util.convertRectFromDimension(this.getBody());
    let bounceLeft = Util.convertRectFromDimension(this.infoArea);
		let bounceRight = Util.convertRectFromDimension(this.handArea);
		this.actionArea.width = bounce.width - bounceLeft.width - bounceRight.width;
  }

	onBlind() { this.delegate.next(new ComponentEvent( UI_EVENT.BLIND )); }
  onFold() { this.delegate.next(new ComponentEvent( UI_EVENT.FOLD )); }
	onSmallBlind() { this.delegate.next(new ComponentEvent( UI_EVENT.SAMALL_BLIND )); }
	onBigBlind() { this.delegate.next(new ComponentEvent( UI_EVENT.BIG_BLIND )); }
  onCheck() { this.delegate.next(new ComponentEvent( UI_EVENT.CHECK )); }
	onCall() { this.delegate.next(new ComponentEvent( UI_EVENT.CALL )); }
  onBat() { this.delegate.next(new ComponentEvent( UI_EVENT.BAT, 2 )); }
	onRaise() { this.delegate.next(new ComponentEvent( UI_EVENT.RAISE, 2 )); }
  onAllIn() { this.delegate.next(new ComponentEvent( UI_EVENT.ALL_IN )); }
}
