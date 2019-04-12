import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Config from "Util/config";
import { LoadingSpiner } from 'Skeleton/paint';
import * as Login from "ViewModel/login";

class HeaderBody extends ElementProvider {
  writeHTML() {
    this.body.innerHTML =`
    <div class='logo'></div>
    <div class='obj'></div>
    <button id='${this.id}btnJoin' class='btn-join'></button>
    <div id='${this.id}loadingBar' class='loading-bar'></div>
    `;
  }
}

export default class Header extends Component {
  constructor() {
    super();
    this.debuger.tag = 'Header';
    this.btnJoin = null;
    this.loadingBar = new LoadingSpiner();
    Login.model.delegate.subscribe ( this.onLoginEvent.bind(this) );

  }
  remove() {
    super.remove();
    this.info = null;
    this.loadingBar.remove();
    this.loadingBar = null;
  }

  getElementProvider() { return new HeaderBody(this.body); }
  onCreate(elementProvider) {
    let loadingBarBody = elementProvider.getElement('loadingBar');
    let bounce = Util.convertRectFromDimension(loadingBarBody);
    this.loadingBar.init(loadingBarBody, bounce.width, bounce.height);
    this.btnJoin = elementProvider.getElement('btnJoin');
    this.onLoginStatusChange();
  }

  setupEvent() {
    this.attachEvent(this.btnJoin, "click", this.onLoginChange.bind(this) );
  }

  onLoginChange() {
    Login.model.getStatus() == Login.STATUS.LOGIN ? Login.model.logout() : Login.model.login();
  }

  onLoginStatusChange() {
    this.loadingBar.stop();
    this.btnJoin.innerHTML = Login.model.getStatus() == Login.STATUS.LOGIN ? "LOGOUT" : "LOGIN"
  }

  onLoginEvent(event) {
    if(event.type == Login.EVENT.PROGRESS) {
      this.loadingBar.play();
      return;
    }
    this.onLoginStatusChange();
  }

}
