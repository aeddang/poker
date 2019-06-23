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
    <div class ='board'></div>
    <div class='pot'>
      <div id='${this.id}mainPot' class='main-pot'></div>
      <div id='${this.id}sidePot' class='side-pot'>$0000</div>
      <div class='chips'></div>
    </div>
    <div id='${this.id}cardArea' class='cards'></div>
    `;
  }
}



class GameViewerInfo {
  constructor(cardWidth, cardHeight, cardMargin) {
    this.reset();
    this.cardWidth = cardWidth;
		this.cardHeight = cardHeight;
    this.cardMargin = cardMargin;
  }
  reset() {}
}

export default class GameViewer extends SyncPropsComponent {
  constructor(cardWidth, cardHeight, cardMargin) {
    super();
    this.debuger.tag = 'GameViewer';
    this.info = new GameViewerInfo(cardWidth, cardHeight, cardMargin)
    this.cards = [];
  }

  remove() {
    super.remove();
    this.cards.forEach( c => c.remove() );
    this.cards = null;
    this.cardArea = null;
    this.mainPot = null;
    this.sidePot = null;

    this.info = null;
  }

  getElementProvider() { return new GameViewerBody(this.body); }
  onCreate(elementProvider) {
    //this.ante = elementProvider.getElement('ante');
    this.mainPot = elementProvider.getElement('mainPot');
    this.sidePot = elementProvider.getElement('sidePot');
    this.cardArea = elementProvider.getElement('cardArea');
    this.createCards(elementProvider);
    this.onResize();
    this.detachCard()
  }

  createCards(elementProvider){
    for(var i=0; i<5; ++i) {
      let card = new Card().init( this.cardArea, this.info.cardWidth, this.info.cardHeight);
      this.cards.push( card );
    }
  }

  setupWatchs(){
    this.watchs = {
      ante: value =>{
        //this.ante.innerHTML = '$' + value;
      },
      gameBet: value =>{
        //this.gameBet.innerHTML = '$' + value;
      },
      minBet: value =>{
        //this.minBet.innerHTML = '$' + value;
      },

      gamePot: value =>{
        SoundFactory.getInstence().play( SoundFactory.STATIC_SOUND.DROP_POT );
        this.mainPot.innerHTML = '$' + value;
      },
      roundPot: value =>{
        //this.roundPot.innerHTML = '$' + value;
      },

      status: value =>{
        switch ( value ) {
          case Status.Wait:
            break;
          case Status.FreeFlop:
            break;
          case Status.Flop:
            SoundFactory.getInstence().playSideEffect( SoundFactory.SUB_SOUND.FLIP_CARD );
            break;
          case Status.Turn:
            SoundFactory.getInstence().playSideEffect( SoundFactory.SUB_SOUND.FLIP_CARD );
            break;
          case Status.ShowDown:
            break;
        }
      }
    };
  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let width = this.info.cardWidth;
    let height = this.info.cardHeight;
    let margin = this.info.cardMargin;
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
    card.setData( cardData );
    card.burn();
	}

  hideCard( id  ){
    let idx = Number(id);
    let card = this.cards[ idx ];
    card.hidden();
	}

  onShowCard( cardData ){
    let card = this.cards.find( c => { return (c.cardData.suit == cardData.suit && c.cardData.num == cardData.num) });
    if(card == undefined) return false;
    card.show();
    return true;
  }

  getCardPositions(){
    return this.cards.map( c=>{ return {x:c.x, y:c.y} });
  }

}
