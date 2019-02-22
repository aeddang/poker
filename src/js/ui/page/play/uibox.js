import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';

class UiBoxBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
      <p id='${this.id}playerInfoBox' class='player-info'></p>
      <p id='${this.id}gameInfoBox' class='game-info'></p>
      <button id='${this.id}btnFold' class='btn-fold'>fold</button>
      <button id='${this.id}btnAllin' class='btn-allin'>allin</button>
      <button id='${this.id}btnCheck' class='btn-check'>check</button>
      <button id='${this.id}btnBat' class='btn-bat'>bat</button>
    `;
  }
}

export default class UiBox extends Component {
  constructor() {
    super();
    this.playerInfoBox = null;
    this.gameInfoBox = null;
    this.btnFold = null;
    this.btnCheck = null;
    this.btnBat = null;
    this.btnAllin = null;
  }

  remove() {
    super.remove();
    this.playerInfoBox = null;
    this.gameInfoBox = null;
    this.btnFold = null;
    this.btnCheck = null;
    this.btnBat = null;
    this.btnAllin = null;
  }

  getElementProvider() { return new PlayBody(this.body); }
  onCreate(elementProvider) {
    this.playerInfoBox = elementProvider.getElement('playerInfoBox');
    this.gameInfoBox = elementProvider.getElement('gameInfoBox');
    this.btnFold = elementProvider.getElement('btnFold');
    this.btnCheck = elementProvider.getElement('btnCheck');
    this.btnBat = elementProvider.getElement('btnBat');
    this.btnAllin = elementProvider.getElement('btnAllin');
  }

  setupEvent() {
    this.attachEvent(this..btnFold, "click", this.onFold.bind(this));
    this.attachEvent(this.btnCheck, "click", this.onCheck.bind(this));
    this.attachEvent(this.btnBat, "click", this.onBat.bind(this));
    this.attachEvent(this.btnAllin, "click", this.onAllin.bind(this));
  }

  onUpdateStatus(status){

  }

  onFold() {
  }

  onCheck() {
  }

  onBat() {
  }

  onAllin() {
  }
}
