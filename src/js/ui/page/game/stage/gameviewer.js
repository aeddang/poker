import SyncPropsComponent from 'Component/syncpropscomponent';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import { decoratorDynamicDom } from 'Skeleton/uielement';
import Card from '../card'
import { Status } from '../gamestatus'
import * as SoundFactory from 'Root/soundfactory';
class GameViewerBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
    <div class ='logo-center'></div>
    <div class='info'>
      <div class='ante'><span class='title'>ante</span><span id='${this.id}ante' class='text'></span></div>
      <div class='min-bet'><span class='title'>bet</span><span id='${this.id}minBet' class='text'></span></div>
      <div class='game-bet'><span class='title'>total</span><span id='${this.id}gameBet' class='text'></span></div>
    </div>
    <div class='pot'>
      <div id='${this.id}round' class='round'></div>
      <div class='main-pot'><span class='title'>mainpot</span><span id='${this.id}mainPot' class='text'></span></div>
      <div class='round-pot'><span class='title'>roundpot</span><span id='${this.id}roundPot' class='text'></span></div>
      <div class='side-pot'><span class='title'>sidepot</span><span id='${this.id}sidePot' class='text'></span></div>
    </div>
    <div id='${this.id}cardArea' class='cards'>
    <div>
    `;
  }
}

class GameViewerInfo {
  constructor(cardWidth, cardHeight) {
    this.reset();
    this.cardWidth = cardWidth;
		this.cardHeight = cardHeight;
  }
  reset() {}
}

export default class GameViewer extends SyncPropsComponent {
  constructor(cardWidth, cardHeight) {
    super();
    this.debuger.tag = 'GameViewer';
    this.info = new GameViewerInfo(cardWidth, cardHeight)
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
    this.info = null;
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
    this.detachCard()
  }

  createCards(elementProvider){
    for(var i=0; i<5; ++i) {
      let card = new Card().init( this.cardArea, this.info.cardWidth, this.info.cardHeight);
      this.cards.push( card );
      card.hidden();
    }
  }

  setupWatchs(){
    this.watchs = {
      ante: value =>{
        this.ante.innerHTML = '$' + value;
      },
      gameBet: value =>{
        this.gameBet.innerHTML = '$' + value;
      },
      minBet: value =>{
        this.minBet.innerHTML = '$' + value;
      },

      gamePot: value =>{
        SoundFactory.getInstence().play( SoundFactory.STATIC_SOUND.DROP_POT );
        this.mainPot.innerHTML = '$' + value;
      },
      roundPot: value =>{
        this.roundPot.innerHTML = '$' + value;
      },

      status: value =>{
        switch ( value ) {
          case Status.Wait:
            this.round.innerHTML = 'Wait'
            break;
          case Status.FreeFlop:
            this.round.innerHTML = 'Free Flop'
            break;
          case Status.Flop:
            SoundFactory.getInstence().playSideEffect( SoundFactory.SUB_SOUND.FLIP_CARD );
            this.round.innerHTML = 'Flop'
            break;
          case Status.Turn:
            SoundFactory.getInstence().playSideEffect( SoundFactory.SUB_SOUND.FLIP_CARD );
            this.round.innerHTML = 'Turn'
            break;
          case Status.ShowDown:
            this.round.innerHTML = 'Show Down'
            break;
        }
      }
    };
  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let width = this.info.cardWidth;
    let height = this.info.cardHeight;
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
    this.sidePot.innerHTML = '$' + pot;
  }

  attachCard(){
    this.cards.forEach( card => card.visible = true);
	}

  detachCard(){
    this.cards.forEach( card => card.visible = false);
	}

  burnCard( id , cardData ){
    let idx = Number(id);
    let card = this.cards[ idx ];
    this.debuger.log(cardData, 'burnCard');
    card.setData( cardData );
    card.burn();
	}

  hideCard( id  ){
    let idx = Number(id);
    let card = this.cards[ idx ];
    card.hidden();
	}

  getCardPositions(){
    return this.cards.map( c=>{ return {x:c.x, y:c.y} });
  }

}
