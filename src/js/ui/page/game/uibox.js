import SyncPropsComponent from 'Component/syncpropscomponent';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';

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


class UiBoxBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
      <p id='${this.id}playerInfoBox' class='player-info'></p>
      <p id='${this.id}gameInfoBox' class='game-info'></p>
			<button id='${this.id}btnBlind' class='btn-blind'>B</button>
      <button id='${this.id}btnFold' class='btn-fold'>F</button>
      <button id='${this.id}btnSmallBlind' class='btn-small-blind'>SB</button>
			<button id='${this.id}btnBigBlind' class='btn-big-blind'>BB</button>
			<button id='${this.id}btnCheck' class='btn-check'>CK</button>
			<button id='${this.id}btnCall' class='btn-call'>C</button>
			<button id='${this.id}btnBat' class='btn-bat'>BT</button>
			<button id='${this.id}btnRaise' class='btn-raise'>RA</button>
      <button id='${this.id}btnAllIn' class='btn-all-in'>ALL</button>
    `;
  }
}

export default class UiBox extends SyncPropsComponent {
  constructor() {
    super();
		this.debuger.tag = 'UiBox';
  }

  remove() {
    super.remove();
    this.playerInfoBox = null;
    this.gameInfoBox = null;
		this.btnFold = null;
		this.btnSmallBlind = null;
		this.btnBigBlind = null;
		this.btnCheck = null;
		this.btnCall = null;
		this.btnBat = null;
		this.btnRaise = null;
		this.btnAllIn = null;
  }

  getElementProvider() { return new UiBoxBody(this.body); }
  onCreate(elementProvider) {
    this.playerInfoBox = elementProvider.getElement('playerInfoBox');
    this.gameInfoBox = elementProvider.getElement('gameInfoBox');
		this.btnBlind = elementProvider.getElement('btnBlind');
    this.btnFold = elementProvider.getElement('btnFold');
		this.btnSmallBlind = elementProvider.getElement('btnSmallBlind');
		this.btnBigBlind = elementProvider.getElement('btnBigBlind');
		this.btnCheck = elementProvider.getElement('btnCheck');
		this.btnCall = elementProvider.getElement('btnCall');
		this.btnBat = elementProvider.getElement('btnBat');
		this.btnRaise = elementProvider.getElement('btnRaise');
		this.btnAllIn = elementProvider.getElement('btnAllIn');
  }

	setupWatchs(){
		this.watchs = {
      isActive: value =>{
        this.debuger.log(value, 'isActive');
      },
      bankroll: value =>{
        this.debuger.log(value, 'bankroll');
      },
      gameBat: value =>{
        this.debuger.log(value, 'gameBat');
      },
      checkBat: value =>{
        this.debuger.log(value, 'checkBat');
      },
      time: value =>{
        this.debuger.log(value, 'time');
      },
			actionBlind: value => { this.setActionButton( this.btnBlind,  value ) },
			actionFold: value => { this.setActionButton( this.btnFold,  value ) },
	    actionSmallBlind: value => { this.setActionButton( this.btnSmallBlind,  value ) },
	    actionBigBlind: value => { this.setActionButton( this.btnBigBlind,  value ) },
	    actionCheck: value => { this.setActionButton( this.btnCheck,  value ) },
	    actionCall: value => { this.setActionButton( this.btnCall,  value ) },
	    actionBat: value => { this.setActionButton( this.btnBat,  value ) },
	    actionRaise: value => { this.setActionButton( this.btnRaise,  value ) },
	    actionAllIn: value => { this.setActionButton( this.btnAllIn,  value ) },
    };
  }

	setActionButton( btn , value ){
		btn.style.display = value ? 'block' : 'none';
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
