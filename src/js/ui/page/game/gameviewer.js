import SyncPropsComponent from 'Component/syncpropscomponent';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';


class GameViewerBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
    <div class='info'>
      <div id='${this.id}ante' class='ante'></div>
      <div id='${this.id}minBat' class='min-bat'></div>
      <div id='${this.id}gameBat' class='game-bat'></div>

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

const CARD_WIDTH = 50;
const CARD_HEIGHT = 80;

export default class GameViewer extends SyncPropsComponent {
  constructor() {
    super();
    this.debuger.tag = 'GameViewer';
    this.cards = [];
  }

  remove() {
    super.remove();
    this.cards = null;
    this.cardArea = null;
    this.ante = null;
    this.mainPot = null;
    this.sidePot = null;
    this.minBat = null;
    this.round = null;
    this.roundPot = null;
    this.gameBat = null;
  }

  getElementProvider() { return new GameViewerBody(this.body); }
  onCreate(elementProvider) {
    this.ante = elementProvider.getElement('ante');
    this.mainPot = elementProvider.getElement('mainPot');
    this.sidePot = elementProvider.getElement('sidePot');
    this.minBat = elementProvider.getElement('minBat');
    this.round = elementProvider.getElement('round');
    this.roundPot = elementProvider.getElement('roundPot');
    this.gameBat = elementProvider.getElement('gameBat');
    this.cardArea = elementProvider.getElement('cardArea');
    this.createCards();
    this.onResize();
  }

  createCards(){
    for(var i=0; i<5; ++i) {
      let card = document.createElement("div");
      card.classList.add("card");
      card.style.width = Util.getStyleUnit( CARD_WIDTH );
      card.style.height = Util.getStyleUnit( CARD_HEIGHT );
      card.innerHTML = 'hidden';
      this.cardArea.appendChild( card );
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
      minBat: value =>{
        this.minBat.innerHTML = 'Bat : ' + value;
      },
      roundPot: value =>{
        this.roundPot.innerHTML = 'RoundPot : ' + value;
      },
      gameBat: value =>{
        this.gameBat.innerHTML = 'GameBat : ' + value;
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
      card.style.left = Util.getStyleUnit( posX );
      posX += ( width + margin )
      card.style.top = Util.getStyleUnit( posY );
    });
  }

  addSidePot( pot ){
    if(pot == 0) this.sidePot.display = 'none';
    else this.sidePot.display = 'block';
    this.sidePot.innerHTML = 'sidePot : ' + pot;
  }

  burnCard( id , cardData ){
    let idx = Number(id);
    let card = this.cards[ idx ];
    card.innerHTML = cardData.suit + " : " + cardData.num;
	}
  hideCard( id  ){
    let idx = Number(id);
    let card = this.cards[ idx ];
    card.innerHTML = 'hidden';
	}
}

export const Status = Object.freeze ({
  Wait: 1,
  FreeFlop: 2,
  Flop: 3,
  Turn: 4,
  ShowDown: 5,
});
