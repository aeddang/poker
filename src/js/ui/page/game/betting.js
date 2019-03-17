import Component from 'Skeleton/component';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';


const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;

class BettingBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
    <div id='${this.id}bet' class='bet'></div>
  	<button id='${this.id}btnMultiply' class='btn-multiply'>X</button>
  	<button id='${this.id}btnIncrease' class='btn-increase'>+</button>
  	<button id='${this.id}btnDecrease' class='btn-decrease'>-</button>
    <button id='${this.id}btnBet' class='btn-bet'>Confirm</button>
  	<button id='${this.id}btnReset' class='btn-reset'>Reset</button>
    `;
  }
}

export default class Betting extends Component {
  constructor() {
    super();
    this.minBet = 0;
    this.maxBet = 0;
    this.eventType = -1;
    this._currentBet = 0;
		this.debuger.tag = 'Betting';
  }

  remove() {
    super.remove();
    this.bet = null;
    this.btnBet = null;
    this.btnMultiply = null;
		this.btnIncrease = null;
		this.btnDecrease = null;
    this.btnReset = null;
  }

  getElementProvider() { return new BettingBody(this.body); }
  onCreate(elementProvider) {
    this.bet = elementProvider.getElement('bet');
    this.btnBet = elementProvider.getElement('btnBet');
    this.btnMultiply = elementProvider.getElement('btnMultiply');
		this.btnIncrease = elementProvider.getElement('btnIncrease');
		this.btnDecrease = elementProvider.getElement('btnDecrease');
    this.btnReset = elementProvider.getElement('btnReset');
  }

  setupEvent() {
		this.attachEvent(this.btnBet, "click", this.onBet.bind(this));
		this.attachEvent(this.btnMultiply, "click", this.onMultiply.bind(this));
		this.attachEvent(this.btnIncrease, "click", this.onIncrease.bind(this));
		this.attachEvent(this.btnDecrease, "click", this.onDecrease.bind(this));
    this.attachEvent(this.btnReset, "click", this.onReset.bind(this));
  }

  active(minBet, maxBet, eventType){
    this.minBet = minBet;
    this.maxBet = maxBet;
    this.eventType = eventType;
    this.currentBet = minBet;
    this.debuger.log(this.currentBet, 'this.currentBet');
    this.getBody().visible = true;
  }

  passive(){
    this.getBody().visible = false;
  }

  set currentBet( v ){
    if( v < this.minBet ) v = this.minBet;
    if( v > this.maxBet ) v = this.maxBet;
    this._currentBet = v;
    this.bet.innerHTML = "bet: "+this._currentBet
    this.debuger.log(this._currentBet, 'this._currentBet');
  }
  get currentBet(){ return this. _currentBet}

  onBet() {
    this.delegate.next(new ComponentEvent( this.eventType , this._currentBet ));
    this.passive();
  }
  onMultiply() { this.currentBet = this._currentBet * 2; }
	onIncrease() { this.currentBet = this._currentBet + 1; }
	onDecrease() { this.currentBet = this._currentBet - 1; }
  onReset() { this.currentBet = this.minBet; }
}
