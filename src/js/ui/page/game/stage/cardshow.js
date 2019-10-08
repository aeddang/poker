import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import ComponentEvent from 'Skeleton/event';
import * as Util from 'Skeleton/util';
import { animation, animationAndComplete } from 'Skeleton/animation';
import Card from '../card'
import * as SoundFactory from 'Util/soundfactory';
class CardShowBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
    <div id='${this.id}cardArea' class='cards'>
    `;
  }
}

export const SHOW_EVENT = Object.freeze ({
	SHUFFLE_COMPLETED: 1,
	DISCARD_COMPLETED: 2
});

class CardShowInfo {
  constructor(cardWidth, cardHeight, cardMargin) {
    this.reset();
    this.cardNum =30;
		this.centerX = -1;
    this.centerY = 0;
    this.cardWidth = cardWidth;
		this.cardHeight = cardHeight;
    this.cardMargin = cardMargin;
  }
  reset() {}
}

export default class CardShow extends Component {
  constructor(cardWidth, cardHeight) {
    super();
    this.debuger.tag = 'CardShow';
    this.info = new CardShowInfo(cardWidth, cardHeight)
    this.animating = false;
    this.cards = [];
  }

  remove() {
    super.remove();
    this.cards.forEach( c => c.remove() );
    this.cards = null;
    this.cardArea = null;
    this.info = null;
  }

  getElementProvider() { return new CardShowBody(this.body); }
  onCreate(elementProvider) {
    this.cardArea = elementProvider.getElement('cardArea');
    this.createCards(elementProvider);
    this.onResize();
    this.getBody().visible = false;
  }

  createCards(elementProvider){
    for(var i=0; i<this.info.cardNum; ++i) {
      let card = new Card().init( this.cardArea, this.info.cardWidth, this.info.cardHeight);
      this.cards.push( card );
    }
  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    this.info.centerX = (bounce.width - this.info.cardWidth) / 2;
    this.info.centerY = (bounce.height - this.info.cardHeight) / 2;
    if( this.animating ) return;
    this.cards.forEach( (card, idx) => {
      card.x = this.info.centerX;
      card.y = this.info.centerY;
    });
  }

  shuffle(communityCards, players){
    this.getBody().style.zIndex = 9999;
    this.getBody().visible = true;
    this.animating = true;
    this.shuffleStap1(communityCards, players);
  }

  shuffleStap1(communityCards, players){
    SoundFactory.getInstence().playSideEffect( SoundFactory.SUB_SOUND.SHUFFLE_CARD );
    let len = this.cards.length - 1;
    let deltaRotation = 360/len;
    this.cards.forEach( (card, idx) => {
      let rt = deltaRotation * idx;
      animationAndComplete(
        card.getBody(),
        { rotateZ: rt + "deg",
          opacity:1 },
        () => { if(idx == len) this.shuffleStap2(communityCards, players);}
      );
    });
  }

  shuffleStap2(communityCards, players){
    SoundFactory.getInstence().playSideEffect( SoundFactory.SUB_SOUND.SHUFFLE_CARD );
    let len = this.cards.length - 1;
    let viewWidth = 500;
    let deltaX = viewWidth/len;
    let ty = this.info.centerY - 100
    let tx = this.info.centerX - (viewWidth/2);
    this.cards.forEach( (card, idx) => {
      let rt = this.getDegree(tx + (this.info.cardWidth/2), ty);
      animationAndComplete(
        card.getBody(),
        { rotateZ:  rt + "deg",
          left: tx,
          top: ty },
        () => { if(idx == len) this.shuffleStap3(communityCards, players);}
      );
      tx += deltaX;
    });
  }

  shuffleStap3(communityCards, players){
    SoundFactory.getInstence().playSideEffect( SoundFactory.SUB_SOUND.SHUFFLE_CARD );
    let len = this.cards.length - 1;
    this.cards.forEach( (card, idx) => {
      animationAndComplete(
        card.getBody(),
        { rotateZ: "0deg",
          left: this.info.centerX },
        () => { if(idx == len) this.distribution(communityCards, players);}
      );
    });
  }

  distribution(communityCards, players){
    SoundFactory.getInstence().play( SoundFactory.STATIC_SOUND.THROW_CARD );
    var cardIdx = 0;
    players.forEach( player => {
      let card = this.cards[cardIdx];
      let rt = this.getDegree(player.x, player.y);
      animation(
        card.getBody(),
        { rotateZ: rt + "deg",
          left: player.x,
          top: player.y,
          opacity:0 }
      )
      cardIdx ++;
    });

    communityCards.forEach( communityCard => {
      let card = this.cards[cardIdx];
      animation(
        card.getBody(),
        { rotateZ: "0deg",
          left: communityCard.x,
          top: communityCard.y }
      )
      cardIdx ++;
    });

    let len = this.cards.length - 1;
    for(var i = cardIdx; i <= len; ++i){
      let card = this.cards[i];
      let aniData = { top: 100, opacity:0 };
      if(i == len){
        animationAndComplete(
          card.getBody(),aniData,
          () => {
            this.getBody().visible = false;
            this.getBody().style.zIndex = 'auto';
            this.delegate.next(new ComponentEvent( SHOW_EVENT.SHUFFLE_COMPLETED ))
          }
        );
      }else{
        animation( card.getBody(),aniData );
      }
    }
  }

  getDegree(tx, ty){
    let dx = tx - (this.info.centerX + (this.info.cardWidth/2))
    let dy = ty - (this.info.centerY + (this.info.cardHeight/2))
    let r = Math.atan2(dx,-dy);
    return 180 * r / Math.PI;
  }

  discard(communityCards, players){
    var cardIdx = 0;
    players.forEach( player => {
      let card = this.cards[cardIdx];
      card.x = player.x;
      card.y = player.y;
      card.rotateZ = this.getDegree(player.x, player.y);
      card.opacity = 0;
      cardIdx ++;
    });
    this.getBody().visible = true;
    this.getBody().style.zIndex = 'auto';
    communityCards.forEach( communityCard => {
      let card = this.cards[cardIdx];
      card.x = communityCard.x;
      card.y = communityCard.y;
      card.opacity = 1;
      cardIdx ++;
    });
    this.animating = true;
    let len = this.cards.length - 1;
    for(var i = cardIdx; i <= len; ++i){
      let card = this.cards[i];
      card.x = this.info.centerX;
      card.y = this.info.centerY - 10;
    }

    this.cards.forEach( (card, idx) => {
      animationAndComplete(
        card.getBody(),
        { rotateZ: "0deg",
          rotateY: "180deg",
          left: Util.getStyleUnit(this.info.centerX),
          top: Util.getStyleUnit(this.info.centerY),
          opacity:1
        },
        () => { if(idx == len) {
          this.animating = false;
          this.delegate.next(new ComponentEvent( SHOW_EVENT.DISCARD_COMPLETED ))
        }}
      );
    });
  }

}
