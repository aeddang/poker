import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Login from "ViewModel/login";

class HomeBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("home");
    cell.innerHTML =`
    <p class='title'>Texas hold'em</p>
    <button id='${this.id}btnJoin' class='btn-join'>GAME START</button>
    `;
    this.body.appendChild(cell);
  }
}

export default class Home extends Component {
  constructor() {
    super();
    this.btnJoin = null;
  }

  init(body, client, options) {
    return super.init(body, client, options);
  }

  remove() {
    super.remove();
    this.btnJoin = null;
  }

  getElementProvider() { return new HomeBody(this.body); }
  onCreate(elementProvider) {
    this.btnJoin = elementProvider.getElement('btnJoin');
    super.onCreate(elementProvider);
  }

  setupEvent() {
    this.attachEvent(this.btnJoin, "click", e => {Login.model.login();} );
  }
}
