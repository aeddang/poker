import SyncPropsComponent from 'Component/syncpropscomponent';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import Card from '../card'
import Betting from './betting'
import { animation, animationAndComplete, animationWithDelay } from 'Skeleton/animation';
import { Status, PositionStatus, NetworkStatus } from  "../playerstatus";
import * as SoundFactory from 'Util/soundfactory';

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

const CARD_WIDTH = 84;
const CARD_HEIGHT = 126;

class UiBoxInfo {
  constructor() {
    this.reset();
		this.checkPot = 0;
    this.minBet = 0;
		this.bankroll = 0;
		this.isSelectedPlayer = false;
  }
  reset() {}
}

class UiBoxBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
			<div id='${this.id}hands' class='hands'></div>
			<div id='${this.id}bettingArea' class='betting-area'></div>
			<div id='${this.id}actionArea' class='action-area'>
	      <button id='${this.id}btnFold' class='btn-fold'>Fold</button>
	      <button id='${this.id}btnSmallBlind' class='btn-small-blind'>SBlind</button>
				<button id='${this.id}btnBigBlind' class='btn-big-blind'>BBlind</button>
				<button id='${this.id}btnCheck' class='btn-check'>Check</button>
				<button id='${this.id}btnCall' class='btn-call'>Call</button>
	      <button id='${this.id}btnAllIn' class='btn-all-in'>Allin</button>
			</div>
			<div class= 'info-area'>
			   <div id='${this.id}gameBet' class='game-bet'></div>
			   <div id='${this.id}check' class='check'></div>
				 <div id='${this.id}bet' class='bet'></div>
			</div>
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
		this.removeCards();
		this.betting = null;

		this.check = null;
		this.bet = null;
		this.gameBet = null;

		this.btnFold = null;
		this.btnSmallBlind = null;
		this.btnBigBlind = null;
		this.btnCheck = null;
		this.btnCall = null;
		this.btnAllIn = null;
		this.hands = null;
	  this.bettingArea = null;
		this.actionArea = null;
  }

  getElementProvider() { return new UiBoxBody(this.body); }
  onCreate(elementProvider) {
		this.check = elementProvider.getElement('check');
		this.bet = elementProvider.getElement('bet');
		this.gameBet = elementProvider.getElement('gameBet');
		this.btnBlind = elementProvider.getElement('btnBlind');
    this.btnFold = elementProvider.getElement('btnFold');
		this.btnSmallBlind = elementProvider.getElement('btnSmallBlind');
		this.btnBigBlind = elementProvider.getElement('btnBigBlind');
		this.btnCheck = elementProvider.getElement('btnCheck');
		this.btnCall = elementProvider.getElement('btnCall');
		this.btnAllIn = elementProvider.getElement('btnAllIn');
		this.actionArea = elementProvider.getElement('actionArea');
		this.bettingArea = elementProvider.getElement('bettingArea');
		this.hands = elementProvider.getElement('hands');
  	this.betting.init( this.bettingArea ).subscribe ( this.onBetEvent.bind(this) );
    this.hands.opacity = 0;
		this.actionArea.opacity = 0;

  }

	setupWatchs(){
		this.watchs = {
			checkBet: value =>{
				this.info.checkPot = value;
				if(value == 0) this.check.innerHTML = '';
				else this.check.innerHTML = 'check $'+value;
      },
			bankroll: value =>{
        this.info.bankroll = value;
      },
	    minBet: value =>{
				this.info.minBet = value;
				if(value == 0) this.bet.innerHTML = '';
				else this.bet.innerHTML = 'bet $'+value;

      },
			gameBet: value =>{
				if(value == 0) this.gameBet.innerHTML = '';
				else this.gameBet.innerHTML = 'total $'+value;
      },
			status: value =>{
        switch ( value ) {
          case Status.Wait:
					this.resetHand();
					break;
				}
			},
			isWinner: value =>{
        if(value == null || value == "") return;
        let key = value  ? SoundFactory.SOUND.WIN : SoundFactory.SOUND.LOSE;
        SoundFactory.getInstence().playEffect( key );
      },

			isActive: value =>{
				this.betting.passive();
        if(value) SoundFactory.getInstence().playEffect( SoundFactory.SOUND.TURN );
      },

			actionBlind: value => { },
			actionFold: value => { this.setActionButton( this.btnFold,  value ) },
	    actionSmallBlind: value => { this.setActionButton( this.btnSmallBlind,  value ) },
	    actionBigBlind: value => { this.setActionButton( this.btnBigBlind,  value ) },
	    actionCheck: value => { this.setActionButton( this.btnCheck,  value ) },
	    actionCall: value => { this.setActionButton( this.btnCall,  value ) },
	    actionBet: value => { if(value) this.onBet(UI_EVENT.BET) },
	    actionRaise: value => { if(value) this.onBet(UI_EVENT.RAISE) },
	    actionAllIn: value => { this.setActionButton( this.btnAllIn,  value ) }
    };
  }
	setActionButton( btn , value ) {
		btn.visible = value ;
	}

	onBetEvent( e ){
		//this.viewActionInfo("BET!! <br>" + e.data);
		this.delegate.next( e );
	}
	onJoin(player){
	}
	onResize() {
    super.onResize();
  }
	onMovePosition( playerBounce ){
		if(!this.info.isSelectedPlayer) return;
		this.getBody().x = playerBounce.x;
		this.getBody().y = playerBounce.y;
	}
	onSelectedPosition( playerBounce ){
		animationAndComplete( this.getBody(),{ left:playerBounce.x, top:playerBounce.y },
		p => {
			 this.info.isSelectedPlayer = true;
			 animation( this.actionArea ,{ opacity:1 } );
		});
	}

	onPushHand(cardDatas){
    this.cardDatas = cardDatas

		this.cards = [];
		cardDatas.forEach( data => {
			let card = new Card().init( this.hands , CARD_WIDTH , CARD_HEIGHT, 0 , 0);
			card.setData(data);
      this.cards.push( card );
		});

		animationAndComplete( this.hands,{ opacity:1, top: (-CARD_HEIGHT + 5) },
		p => {
      this.cards.forEach( (c, idx) => animation(c.getBody(), { left: CARD_WIDTH * idx } ));
		});
	}

	resetHand(){
		animationAndComplete( this.hands,{ opacity:0, top: -CARD_HEIGHT + 10 },
		p => { this.removeCards() });

	}

	removeCards(){
		if(this.cards == null) return;
		this.cards.forEach( c => c.remove() );
		this.cards = null;
	}

	onOpenCard( idx, cardData ) {
    if(this.cards == null) return;
		let card = this.cards.find( c => { return (c.cardData.suit == cardData.suit && c.cardData.num == cardData.num) });
    if(card == undefined) return;
    if(!card.isBurn) card.burn();
  }

	onShowCard( idx, cardData ) {
    if(this.cards == null) return;
		let card = this.cards.find( c => { return (c.cardData.suit == cardData.suit && c.cardData.num == cardData.num) });
    if(card == undefined) return;
    card.show();
  }

  hideCard( id ) {

  }

  setupEvent() {
		this.attachEvent(this.btnFold, "click", this.onFold.bind(this));
		this.attachEvent(this.btnSmallBlind, "click", this.onSmallBlind.bind(this));
		this.attachEvent(this.btnBigBlind, "click", this.onBigBlind.bind(this));
    this.attachEvent(this.btnCheck, "click", this.onCheck.bind(this));
		this.attachEvent(this.btnCall, "click", this.onCall.bind(this));
    this.attachEvent(this.btnAllIn, "click", this.onAllIn.bind(this));
  }

	onBet(evtType) {
		this.debuger.log(evtType, 'onBet');
    this.betting.active(this.info.checkPot, this.info.minBet, this.info.bankroll, evtType);
	}

	onBlind() {
		this.delegate.next(new ComponentEvent( UI_EVENT.BLIND ));
	}
  onFold() {
		this.delegate.next(new ComponentEvent( UI_EVENT.FOLD ));
	}
	onSmallBlind() {
		this.delegate.next(new ComponentEvent( UI_EVENT.SAMALL_BLIND ));
	}
	onBigBlind() {
		this.delegate.next(new ComponentEvent( UI_EVENT.BIG_BLIND ));
	}
  onCheck() {
		this.delegate.next(new ComponentEvent( UI_EVENT.CHECK ));
	}
	onCall() {
		this.delegate.next(new ComponentEvent( UI_EVENT.CALL ));
	}
  onAllIn() {
		this.delegate.next(new ComponentEvent( UI_EVENT.ALL_IN ));
	}
}
