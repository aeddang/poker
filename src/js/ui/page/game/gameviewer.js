import SyncPropsComponent from 'Component/syncpropscomponent';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import { decoratorDynamicDom } from 'Skeleton/uielement';
import Card from './card'

class GameViewerBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
    <div class='info'>
      <div id='${this.id}ante' class='ante'></div>
      <div id='${this.id}minBet' class='min-bet'></div>
      <div id='${this.id}gameBet' class='game-bet'></div>

    </div>
    <div class='pot'>
      <div id='${this.id}round' class='round'></div>
      <div id='${this.id}mainPot' class='main-pot'></div>
      <div id='${this.id}roundPot' class='round-pot'></div>
      <div id='${this.id}sidePot' class='side-pot'></div>
    </div>
    <div id='${this.id}cardArea' class='cards'>
    <div>
    `;
  }
}

const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;

export default class GameViewer extends SyncPropsComponent {
  constructor() {
    super();
    this.debuger.tag = 'GameViewer';
    this.cards = [];
  }

  remove() {
    super.remove();
    this.cards.forEach( c => c.remove() );
    this.cards = null;
    this.cardArea = null;
    this.ante = null;
    this.mainPot = null;
    this.sidePot = null;
    this.minBet = null;
    this.round = null;
    this.roundPot = null;
    this.gameBet = null;
  }

  getElementProvider() { return new GameViewerBody(this.body); }
  onCreate(elementProvider) {
    this.ante = elementProvider.getElement('ante');
    this.mainPot = elementProvider.getElement('mainPot');
    this.sidePot = elementProvider.getElement('sidePot');
    this.minBet = elementProvider.getElement('minBet');
    this.round = elementProvider.getElement('round');
    this.roundPot = elementProvider.getElement('roundPot');
    this.gameBet = elementProvider.getElement('gameBet');
    this.cardArea = elementProvider.getElement('cardArea');
    this.createCards(elementProvider);
    this.onResize();
  }

  createCards(elementProvider){
    for(var i=0; i<5; ++i) {
      let card = new Card().init( this.cardArea, CARD_WIDTH, CARD_HEIGHT);
      this.cards.push( card );
    }
  }

  setupWatchs(){
    this.watchs = {
      ante: value =>{
        this.ante.innerHTML = 'Ante: ' + value;
      },
      gamePot: value =>{
        this.mainPot.innerHTML = 'MainPot: ' + value;
      },
      minBet: value =>{
        this.minBet.innerHTML = 'Bet : ' + value;
      },
      roundPot: value =>{
        this.roundPot.innerHTML = 'RoundPot : ' + value;
      },
      gameBet: value =>{
        this.gameBet.innerHTML = 'GameBet : ' + value;
      },
      status: value =>{
        switch ( value ) {
          case Status.Wait:
            this.round.innerHTML = 'Wait'
            break;
          case Status.FreeFlop:
            this.round.innerHTML = 'FreeFlop'
            break;
          case Status.Flop:
            this.round.innerHTML = 'Flop'
            break;
          case Status.Turn:
            this.round.innerHTML = 'Turn'
            break;
          case Status.ShowDown:
            this.round.innerHTML = 'ShowDown'
            break;
        }
      }
    };
  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let width = CARD_WIDTH;
    let height = CARD_HEIGHT;
    let margin = 10;
    let len = this.cards.length;
    var posX = (bounce.width - (width * len) - (margin * (len-1))) /2;
    let posY = ( bounce.height - height ) /2;
    var rotate = -90;
    var sumRotate = 360 / len;
    this.cards.forEach( (card, idx) => {
      card.x = posX;
      posX += ( width + margin )
      card.y = posY;
    });
  }

  addSidePot( pot ){
    if(pot == 0) this.sidePot.visible = false;
    else this.sidePot.visible = true;
    this.sidePot.innerHTML = 'sidePot : ' + pot;
  }

  burnCard( id , cardData ){
    let idx = Number(id);
    let card = this.cards[ idx ];
    this.debuger.log(cardData, 'burnCard');
    card.burn( cardData );
	}
  hideCard( id  ){
    let idx = Number(id);
    let card = this.cards[ idx ];
    card.hidden();
	}

}

export const Status = Object.freeze ({
  Wait: 1,
  FreeFlop: 2,
  Flop: 3,
  Turn: 4,
  ShowDown: 5,
});
