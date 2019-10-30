import Component from 'Skeleton/component';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import { animation } from 'Skeleton/animation';


const BETTING_LIMITED = 9;

class BettingBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("bet-list");
    this.body.appendChild(cell);
  }
}

class ListItemBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("button");
    cell.id = this.id+'cell';
    cell.classList.add("item");
    this.body.appendChild(cell);
  }
}

class ListItem extends Component {
  constructor() {
    super();
  }

  setData(bet,idx){
    this.bet = bet;
    var text = (idx==0) ? "bet" : 'X' + (idx+1);
    this.getBody().innerHTML = text;
  }

  getElementProvider() { return new ListItemBody(this.body); }

  setupEvent() {
    this.attachEvent(this.getBody(), "click", e => this.delegate.next(this.bet) );
  }
}

export default class Betting extends Component {
  constructor() {
    super();
    this.checkpot = 0;
    this.minBet = 0;
    this.maxBet = 0;
    this.eventType = -1;
    this.isActive = false;
    this.bets = [];
		this.debuger.tag = 'Betting';
  }

  remove() {
    super.remove();
    this.bets.forEach( bet=> bet.remove() );

  }

  getElementProvider() { return new BettingBody(this.body); }
  onCreate(elementProvider) {
    this.getBody().style.opacity = 0;
  }


  active(checkPot, minBet, maxBet, eventType){
    this.isActive = true;
    this.checkPot = checkPot;
    this.minBet = minBet;
    this.maxBet = maxBet;
    var currentBet = minBet + checkPot
    var idx = 0;
    while ( currentBet <= maxBet && idx <= BETTING_LIMITED) {
      let item = new ListItem();
      item.init( this.getBody() ).subscribe ( e => { this.delegate.next( new ComponentEvent( eventType , e ) ) } );
      item.setData(currentBet,idx);
      this.bets.push(item);
      currentBet += minBet;
      idx ++;
      this.debuger.log('onBet ' + currentBet);
    }
    animation( this.getBody() ,{ opacity:1 } );
  }

  passive(){
    this.isActive = false;
    this.bets.forEach( bet=> bet.remove() );
    this.bets = [];
    animation( this.getBody() ,{ opacity:0 } );
  }


  onBet() {
    this.delegate.next(new ComponentEvent( this.eventType , (this.checkPot + this._currentBet) ));
    this.passive();
  }

}
