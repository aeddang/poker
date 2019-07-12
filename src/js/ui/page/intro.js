import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as SoundFactory from 'Root/soundfactory';
import * as Config from "Util/config";

class IntroBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("intro");
    cell.innerHTML =`
    <div class ='logo'></div>
    <div class ='board'></div>
    <button id='${this.id}btnJoin' class='btn-join'>ENTER</button>
    `;
    this.body.appendChild(cell);
  }
}

export default class Intro extends Component {
  constructor() {
    super();
  }

  remove() {
    super.remove();
    this.btnJoin = null;
  }

  getElementProvider() { return new IntroBody(this.body); }
  onCreate(elementProvider) {
    super.onCreate(elementProvider);
    this.btnJoin = elementProvider.getElement('btnJoin');
  }

  setupEvent() {
    this.attachEvent(this.btnJoin, "click", e => {
        Util.enterFullscreen(this.getBody());
        Poker.pageChange(Config.Page.Home);
    } );
  }

}
