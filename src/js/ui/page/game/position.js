import { DomComponent } from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import ComponentEvent from 'Skeleton/event';

export const POSITION_EVENT = Object.freeze ({
	JOIN_GAME: 10,
});

class PositionBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("position");
    cell.innerHTML = `
			<div id='${this.id}title' class='title'>select</div>
      <button id='${this.id}btnJoin' class='btn-join'>select</button>
    `;
    this.body.appendChild(cell);
  }
}

class PositionInfo {
  constructor() {
    this.reset();
		this.idx = -1;
    this.posX = 0;
    this.posY = 0;
    this.radiusX = 0;
    this.radiusY = 0;
		this.rotate = 0;
  }
  reset() {}
}

export default class Position extends DomComponent {
  constructor() {
    super();
    this.debuger.tag = 'Position';
		this.info = new PositionInfo()
    this.info.idx = -1;
  }

  init(body,idx) {
    this.info.idx = idx;
    return super.init(body);
  }
  remove() {
    super.remove();
    this.btnJoin = null;
		this.title = null;
		this.info = null;
  }



  getElementProvider() { return new PositionBody(this.body); }
  onCreate(elementProvider) {
		this.title = elementProvider.getElement('title');
    this.btnJoin = elementProvider.getElement('btnJoin');
		this.title.innerHTML = this.info.idx;
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

	set rotate(rotate){

		this.info.rotate = ( rotate > 0) ? rotate%(Math.PI * 2) : rotate + (Math.PI * 2)
		this.x = this.info.posX + (Math.cos(this.info.rotate) *this.info.radiusX);
		this.y = this.info.posY + (Math.sin(this.info.rotate) *this.info.radiusY);
	}

	get rotate(){
		return this.info.rotate;
	}

  onJoin() {
		this.debuger.log(this.info.idx, 'onJoin');
    this.delegate.next(new ComponentEvent( POSITION_EVENT.JOIN_GAME, this.info.idx ));
  }

  joinPlayer(){
    this.btnJoin.visible = false;
  }

  leavePlayer() {
    //this.btnJoin.style.display = 'block';
  }
}
