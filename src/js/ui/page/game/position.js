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

export default class Position extends DomComponent {
  constructor() {
    super();
    this.debuger.tag = 'Position';
    this.idx = -1;
  }

  init(body,idx) {
    this.idx = idx;
    return super.init(body);
  }
  remove() {
    super.remove();
    this.btnJoin = null;
		this.title = null;
  }

  getElementProvider() { return new PositionBody(this.body); }
  onCreate(elementProvider) {
		this.title = elementProvider.getElement('title');
    this.btnJoin = elementProvider.getElement('btnJoin');
		this.title.innerHTML = this.idx;
  }

  setupEvent() {
    this.attachEvent(this.btnJoin, "click", this.onJoin.bind(this));
  }

  onJoin() {
		this.debuger.log(this.idx, 'onJoin');
    this.delegate.next(new ComponentEvent( POSITION_EVENT.JOIN_GAME, this.idx ));
  }

  joinPlayer(){
    this.btnJoin.visible = false;
  }

  leavePlayer() {
    //this.btnJoin.style.display = 'block';
  }
}
