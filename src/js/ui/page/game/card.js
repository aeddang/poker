import { DomComponent } from 'Skeleton/component';
import { FrameAnimation } from 'Skeleton/paint';

const IMG_PATH = './static/resource/cards.png';

export default class Card extends DomComponent {
  constructor() {
    super();
    this.view = null;
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

  remove() {
    super.remove();
    this.view.remove();
    this.view = null;
  }
  getClassName() { return 'card' }

  burn( cardData ) {
    this.view.frame = Number( cardData.suit ) * 13 + Number( cardData.num );
    this.visible = true;
  }

  hidden( isVisible = true ){
    this.view.clear();
    if( !isVisible ) this.visible = false;
  }

}

const Suit = Object.freeze ({
  Spade : 0,
  Heart : 1,
  Diamond : 2,
  Club : 3
});
