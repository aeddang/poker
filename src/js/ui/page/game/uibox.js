import Component from 'Skeleton/component';
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
	BLIND_ACTION: 9
});


class UiBoxBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
      <p id='${this.id}playerInfoBox' class='player-info'></p>
      <p id='${this.id}gameInfoBox' class='game-info'></p>
      <button id='${this.id}btnFold' class='btn-fold'>fold</button>
      <button id='${this.id}btnSmallBlind' class='btn-small-blind'>fold</button>
			<button id='${this.id}btnBigBlind' class='btn-big-blind'>fold</button>
			<button id='${this.id}btnCheck' class='btn-check'>check</button>
			<button id='${this.id}btnCall' class='btn-call'>fold</button>
			<button id='${this.id}btnBat' class='btn-bat'>bat</button>
			<button id='${this.id}btnRaise' class='btn-raise'>bat</button>
      <button id='${this.id}btnAllin' class='btn-allin'>allin</button>
    `;
  }
}

export default class UiBox extends Component {
  constructor() {
    super();
    this.playerInfoBox = null;
    this.gameInfoBox = null;
    this.btnFold = null;
		this.btnSmallBlind = null;
		this.btnBigBlind = null;
		this.btnCheck = null;
		this.btnCall = null;
		this.btnBat = null;
		this.btnRaise = null;
		this.btnAllin = null;
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
		this.btnAllin = null;
  }

  getElementProvider() { return new UiBoxBody(this.body); }
  onCreate(elementProvider) {
    this.playerInfoBox = elementProvider.getElement('playerInfoBox');
    this.gameInfoBox = elementProvider.getElement('gameInfoBox');
    this.btnFold = elementProvider.getElement('btnFold');
		this.btnSmallBlind = elementProvider.getElement('btnSmallBlind');
		this.btnBigBlind = elementProvider.getElement('btnBigBlind');
		this.btnCheck = elementProvider.getElement('btnCheck');
		this.btnCall = elementProvider.getElement('btnCall');
		this.btnBat = elementProvider.getElement('btnBat');
		this.btnRaise = elementProvider.getElement('btnRaise');
		this.btnAllin = elementProvider.getElement('btnAllin');
  }

  setupEvent() {
    this.attachEvent(this.btnFold, "click", this.onFold.bind(this));
		this.attachEvent(this.btnSmallBlind, "click", this.onSmallBlind.bind(this));
		this.attachEvent(this.btnBigBlind, "click", this.onBigBlind.bind(this));
    this.attachEvent(this.btnCheck, "click", this.onCheck.bind(this));
		this.attachEvent(this.btnCall, "click", this.onCall.bind(this));
    this.attachEvent(this.btnBat, "click", this.onBat.bind(this));
		this.attachEvent(this.btnRaise, "click", this.onRaise.bind(this));
    this.attachEvent(this.btnAllin, "click", this.onAllin.bind(this));
  }

  onUpdateStatus(status){

  }
  onResize() {

  }

  onFold() { this.delegate.next(new ComponentEvent( UI_EVENT.FOLD )); }
	onSmallBlind() { this.delegate.next(new ComponentEvent( UI_EVENT.SAMALL_BLIND )); }
	onBigBlind() { this.delegate.next(new ComponentEvent( UI_EVENT.BIG_BLIND )); }
  onCheck() { this.delegate.next(new ComponentEvent( UI_EVENT.CHECK )); }
	onCall() { this.delegate.next(new ComponentEvent( UI_EVENT.CALL )); }
  onBat() { this.delegate.next(new ComponentEvent( UI_EVENT.BAT, 2 )); }
	onRaise() { this.delegate.next(new ComponentEvent( UI_EVENT.RAISE, 2 )); }
  onAllin() { this.delegate.next(new ComponentEvent( UI_EVENT.ALL_IN )); }
}
