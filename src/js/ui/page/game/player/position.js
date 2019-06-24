import { DomComponent } from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import ComponentEvent from 'Skeleton/event';
import * as Util from 'Skeleton/util';
import { animationAndComplete } from 'Skeleton/animation';


export const POSITION_EVENT = Object.freeze ({
	JOIN_GAME: 10,
	SELECTED_POSITION: 11,
});

class PositionBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("position");
    cell.innerHTML = `
			<div id='${this.id}box' class='box'>
				<button id='${this.id}btnJoin' class='btn-join'>Join</button>
			</div>
		  <div class='profile'>
				<img id='${this.id}profileImg' class='profile-img'></img>
				<div id='${this.id}profileCover' class='profile-cover'></div>
			</div>
    `;
    this.body.appendChild(cell);
  }
}

class PositionInfo {
  constructor() {
    this.reset();
		this.itsMe = false;
		this.idx = -1;
    this.posX = 0;
    this.posY = 0;
    this.radiusX = 0;
    this.radiusY = 0;
		this.rotate = 0;
		this.rotatePos = -1;
  }
  reset() {}
}

export default class Position extends DomComponent {
  constructor() {
    super();
    this.debuger.tag = 'Position';
		this.info = new PositionInfo()
    this.info.idx = -1;
		this.player = null;
  }

  init(body,idx) {
    this.info.idx = idx;
    return super.init(body);
  }
  remove() {
    super.remove();
    this.btnJoin = null;
		this.profileCover = null;
		this.info = null;
		this.player = null;
		this.profileImg = null;
  }



  getElementProvider() { return new PositionBody(this.body); }
  onCreate(elementProvider) {
    this.btnJoin = elementProvider.getElement('btnJoin');
		this.box = elementProvider.getElement('box');
		this.profileCover = elementProvider.getElement('profileCover');
		this.profileImg = elementProvider.getElement('profileImg');
		this.profileImg.visible = false;
		this.profileImg.src = "./static/asset/profile_image.png"
  }

  setupEvent() {
    this.attachEvent(this.btnJoin, "click", this.onJoin.bind(this));
  }
	onResize(posX, posY, radiusX, radiusY){
		this.info.posX = posX;
		this.info.posY = posY;
		this.info.radiusX = radiusX;
		this.info.radiusY = radiusY;
	}

	addPlayer(player){
		this.player = player;
		this.box.appendChild(player);
		this.profileImg.visible = true;
		this.setRotatePos(this.info.rotatePos);
	}

	setMe(){
		this.info.itsMe = true;
	}

	setRotatePos(pos){
		this.info.rotatePos = pos;
		if(this.player == null) return;
		this.player.classList.remove("player-hands-l");
		this.player.classList.remove("player-hands-r");
	
    let left = [0,2,3,4,9];
    let idx = left.indexOf(pos);
    if( idx == -1 ){
      this.player.classList.add("player-hands-r");
    }else{
      this.player.classList.add("player-hands-l");
    }
  }

	set rotate(rotate){
		this.info.rotate = ( rotate > 0) ? rotate%(Math.PI * 2) : rotate + (Math.PI * 2)
		var posX = this.info.posX + (Math.cos(this.info.rotate) *this.info.radiusX);
		var posY = this.info.posY + (Math.sin(this.info.rotate) *this.info.radiusY);
		switch( this.info.rotatePos ){
			case 0 :
				posY += 40;
				break;
			case 4 :
				posX += 25;
				break;
			case 6 :
				posX -= 25;
				break;
			case 3 :
				posX += 40;
				break;
			case 7 :
				posX -= 40;
				break;
			case 1 :
				posX -= 25;
				break;
			case 9 :
				posX += 25;
				break;
		}
		this.x = posX;
		this.y = posY;
	}

	get rotate(){
		return this.info.rotate;
	}

	onAnimationCompleted(){
		if(this.info.itsMe) animationAndComplete( this.getBody(),{ scale:1.2},
		p => {
			this.delegate.next(new ComponentEvent( POSITION_EVENT.SELECTED_POSITION, Util.convertRectFromDimension(this.getBody()) ));
		});
	}

  onJoin() {
    this.delegate.next(new ComponentEvent( POSITION_EVENT.JOIN_GAME, this.info.idx ));
  }

  joinPlayer(){
    this.btnJoin.visible = false;
  }

  leavePlayer(isJoin = true) {
		this.player = null;
		this.profileImg.visible = false;
		if(!isJoin) this.btnJoin.style.display = 'block';
  }
}
