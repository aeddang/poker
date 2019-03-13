import SyncPropsComponent from 'Component/syncpropscomponent';
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
      <button id='${this.id}btnJoin' class='btn-join'></button>
    `;
    this.body.appendChild(cell);
  }
}

export default class Position extends SyncPropsComponent {
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
  }

  setupSyncProps(){
    this.syncProps = {
    };
    this.watchs = {
    };
    super.setupSyncProps();
  }

  getElementProvider() { return new PositionBody(this.body); }
  onCreate(elementProvider) {
    this.btnJoin = elementProvider.getElement('btnJoin');
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
