import { DomComponent } from 'Skeleton/component';
import { FrameAnimation } from 'Skeleton/paint';
import { animationAndProgress, animationStop } from 'Skeleton/animation';
const IMG_PATH = './static/resource/cards.png';

export default class Card extends DomComponent {
  constructor() {
    super();
    this.view = null;
    this.cardData = null;
    this.isBurn = false;
    this.debuger.tag = 'Card';
  }

  init(body, width = 0, height= 0, x = 0, y = 0) {
    super.init(body);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.view = new FrameAnimation();
    this.view.init( this.getBody(), IMG_PATH, 4, 13 );
    this.hidden();
    return this;
  }

  setupEvent() {
    this.attachEvent(this.getBody(), "click", this.onBurn.bind(this));
  }

  remove() {
    animationStop( this.cell );
    super.remove();
    this.view.remove();
    this.view = null;
    this.cardData = null;

  }
  getClassName() { return 'card' }

  setData( cardData , isAutoVisible = false) {
    this.cardData = cardData;
    if(isAutoVisible) this.visible = true;
  }

  onBurn(){
    if(this.cardData == null) return;
    if( this.isBurn ) return;
    this.burn();
  }

  burn( isAutoVisible = false ) {
    if(isAutoVisible) this.visible = true;
    this.isBurn = true;
    animationAndProgress( this.cell, {rotateY: "0deg"}, ( ele, pct ) => {
      if(pct >= 0.5) this.view.frame = Number( this.cardData.suit ) * 13 + Number( this.cardData.num );
    });

  }

  hidden( isAutoVisible = false ){
    this.isBurn = false;
    animationAndProgress( this.cell, {rotateY: "180deg"},( ele, pct ) => {
      if(pct >= 0.5) this.view.clear();
      if(pct == 1.0 && isAutoVisible) this.visible = false;
    });
    this.cardData = null;
  }

}

const Suit = Object.freeze ({
  Spade : 0,
  Heart : 1,
  Diamond : 2,
  Club : 3
});
