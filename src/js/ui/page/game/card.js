import { DomComponent } from 'Skeleton/component';
import { FrameAnimation } from 'Skeleton/paint';
import { animationAndProgress, animationStop } from 'Skeleton/animation';
import * as SoundFactory from 'Root/soundfactory';
import * as ImageFactory from 'Root/imagefactory';
import * as Rx from 'rxjs'
import { take } from 'rxjs/operators'


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
    this.view.init( this.getBody(), ImageFactory.CARD_PATH, 4, 13 );
    this.hidden(false , 10);
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
    this.debuger.log(this.cardData, 'onBurn');
    if(this.cardData == null) return;
    if( this.isBurn ) return;
    SoundFactory.getInstence().playSideEffect( SoundFactory.SUB_SOUND.FLIP_CARD );
    this.burn();
  }

  burn( isAutoVisible = false ) {
    if(isAutoVisible) this.visible = true;
    this.isBurn = true;
    animationAndProgress( this.cell, {rotateY: "0deg", rotateZ:"0deg"}, ( ele, pct ) => {
      if(pct >= 0.5) this.view.frame = Number( this.cardData.suit ) * 13 + Number( this.cardData.num );
    });

  }

  show() {
    this.cell.classList.remove("card-show");
    this.cell.classList.add("card-show");
    this.rxViewAction = Rx.interval(1500).pipe(take(1)).subscribe( {
      next :(t) => { this.cell.classList.remove("card-show"); },
      complete :() => {}
    })
  }

  hidden( isAutoVisible = false , duration = 300){
    this.cell.classList.remove("card-show");
    this.isBurn = false;
    animationAndProgress( this.cell, {rotateY: "180deg"},( ele, pct ) => {
      if(pct >= 0.5) this.view.clear();
      if(pct == 1.0 && isAutoVisible) this.visible = false;
    }, duration );
    this.cardData = null;
  }

}

const Suit = Object.freeze ({
  Spade : 0,
  Heart : 1,
  Diamond : 2,
  Club : 3
});
