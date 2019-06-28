import Component from 'Skeleton/component';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import { animation } from 'Skeleton/animation';


class BettingBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
    <button id='${this.id}btnIncrease' class='btn-increase'></button>
  	<button id='${this.id}btnDecrease' class='btn-decrease'></button>
    <button id='${this.id}btnBet' class='btn-bet'>Bet</button>
  	<button id='${this.id}btnMultiply2' class='btn-multiply'></button>
    <button id='${this.id}btnMultiply4' class='btn-multiply-4'></button>
  	<button id='${this.id}btnReset' class='btn-reset'>Reset</button>
    `;
  }
}

export default class Betting extends Component {
  constructor() {
    super();
    this.checkpot = 0;
    this.minBet = 0;
    this.maxBet = 0;
    this.eventType = -1;
    this._currentBet = 0;
    this.isActive = false;
		this.debuger.tag = 'Betting';
  }

  remove() {
    super.remove();
    this.btnBet = null;
    this.btnMultiply2 = null;
    this.btnMultiply4 = null;
		this.btnIncrease = null;
		this.btnDecrease = null;
    this.btnReset = null;
  }

  getElementProvider() { return new BettingBody(this.body); }
  onCreate(elementProvider) {

    this.btnIncrease = elementProvider.getElement('btnIncrease');
		this.btnDecrease = elementProvider.getElement('btnDecrease');
    this.btnBet = elementProvider.getElement('btnBet');
    this.btnMultiply2 = elementProvider.getElement('btnMultiply2');
    this.btnMultiply4 = elementProvider.getElement('btnMultiply4');
    this.btnReset = elementProvider.getElement('btnReset');
    this.getBody().style.opacity = 0;
  }

  setupEvent() {
		this.attachEvent(this.btnBet, "click", this.onBet.bind(this));
		this.attachEvent(this.btnMultiply2, "click", this.onMultiply2.bind(this));
    this.attachEvent(this.btnMultiply4, "click", this.onMultiply4.bind(this));
		this.attachEvent(this.btnIncrease, "click", this.onIncrease.bind(this));
		this.attachEvent(this.btnDecrease, "click", this.onDecrease.bind(this));
    this.attachEvent(this.btnReset, "click", this.onReset.bind(this));
  }

  active(checkPot, minBet, maxBet, eventType){
    this.isActive = true;
    this.checkPot = checkPot;
    this.minBet = minBet;
    this.maxBet = maxBet;
    this.eventType = eventType;
    this.currentBet = minBet;
    animation( this.getBody() ,{ opacity:1 } );
  }

  passive(){
    this.isActive = false;
    animation( this.getBody() ,{ opacity:0 } );
  }

  set currentBet( v ){
    if( v < this.minBet ) v = this.minBet;
    if( v > this.maxBet ) v = this.maxBet;
    this._currentBet = v;
    this.btnBet.innerHTML = "$"+this._currentBet
  }
  get currentBet(){ return this. _currentBet}

  onBet() {
    this.delegate.next(new ComponentEvent( this.eventType , (this.checkPot + this._currentBet) ));
    this.passive();
  }
  onMultiply2() { this.currentBet = this._currentBet * 2; }
  onMultiply4() { this.currentBet = this._currentBet * 4; }
	onIncrease() { this.currentBet = this._currentBet + 1; }
	onDecrease() { this.currentBet = this._currentBet - 1; }
  onReset() { this.currentBet = this.minBet; }
}
