import { DomComponent } from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import ComponentEvent from 'Skeleton/event';
import * as Util from 'Skeleton/util';
import { animationAndComplete } from 'Skeleton/animation';


export const POSITION_EVENT = Object.freeze ({
	JOIN_GAME: 10,
	SELECTED_POSITION: 11,
	MOVE_POSITION:12
});

class PositionBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("position");
    cell.innerHTML = `
			<div id='${this.id}box' class='box'>
			  <div id='${this.id}textStatus' class='text-status'>Waiting</div>
				<button id='${this.id}btnJoin' class='btn-join'>Join</button>
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
		this.textStatus=null;
		this.info = null;
		this.player = null;

  }

  getElementProvider() { return new PositionBody(this.body); }
  onCreate(elementProvider) {
    this.btnJoin = elementProvider.getElement('btnJoin');
		this.textStatus = elementProvider.getElement('textStatus');
		this.box = elementProvider.getElement('box');
		this.textStatus.visible = false;
  }

  setupEvent() {
    this.attachEvent(this.btnJoin, "click", this.onJoin.bind(this));
  }

	onJoin() {
    this.delegate.next(new ComponentEvent( POSITION_EVENT.JOIN_GAME, this.info.idx ));
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
		this.setRotatePos(this.info.rotatePos);
		this.textStatus.visible = false;
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
				posY += 80;
				break;
			case 4 :
				posX += 50;
				break;
			case 6 :
				posX -= 50;
				break;
			case 1 :
					posX -= 100;
					break;
			case 9 :
					posX += 100;
					break;

		}
		this.x = posX;
		this.y = posY;
		if(this.info.itsMe) this.delegate.next(new ComponentEvent( POSITION_EVENT.MOVE_POSITION, Util.convertRectFromDimension(this.getBody()) ));
	}

	get rotate(){
		return this.info.rotate;
	}

	onAnimationCompleted(){
		if(this.info.itsMe) animationAndComplete( this.getBody(),{ scale:1.5},
		p => {
			this.delegate.next(new ComponentEvent( POSITION_EVENT.SELECTED_POSITION, Util.convertRectFromDimension(this.getBody()) ));
		});
	}

  joinPlayer(){
    this.btnJoin.visible = false;
		if(this.player == null ) this.textStatus.visible = true;
  }

  leavePlayer(isSelected = true) {
		this.player = null;
		this.debuger.log(isSelected, "leavePlayer");
		if( !isSelected ) {
			this.btnJoin.visible = true;
			this.textStatus.visible = false;
		}else{
			this.textStatus.visible = true;
		}
  }
}
