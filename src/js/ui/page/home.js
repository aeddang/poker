import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Login from "ViewModel/login";
import TopNavi from 'Component/topnavi';
import * as SoundFactory from 'Root/soundfactory';

class HomeBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("home");
    cell.innerHTML =`
    <div class ='logo'></div>
    <div class ='board'></div>
    <div id='${this.id}topNaviArea' class='top-navi-area'></div>
    <div id='${this.id}userBoxArea' class='user-box-area'></div>
    <div id='${this.id}rankListArea' class='rank-list-area'></div>
    <div id='${this.id}roomListArea' class='room-list-area'></div>
    <button id='${this.id}btnJoin' class='btn-join'>JOIN GAME</button>
    `;
    this.body.appendChild(cell);
  }
}

export default class Home extends Component {
  constructor() {
    super();
    this.topNavi = new TopNavi();
    this.btnJoin = null;
  }

  init(body, client, options) {
    return super.init(body, client, options);
  }

  remove() {
    super.remove();
    this.topNavi.remove();
    this.topNavi = null;
    this.btnJoin = null;
    this.userBoxArea = null;
    this.rankListArea = null;
  }

  getElementProvider() { return new HomeBody(this.body); }
  onCreate(elementProvider) {
    SoundFactory.getInstence().stopBgm();
    this.userBoxArea = elementProvider.getElement('userBoxArea');
    this.rankListArea = elementProvider.getElement('rankListArea');
    this.topNavi.init(elementProvider.getElement('topNaviArea'));
    this.btnJoin = elementProvider.getElement('btnJoin');
    super.onCreate(elementProvider);
  }

  setupEvent() {
    this.attachEvent(this.btnJoin, "click", e => {
      SoundFactory.getInstence().playBgm(SoundFactory.BGM.DEFAULT);
      Login.model.login();
    } );
  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let bounceBox = Util.convertRectFromDimension(this.userBoxArea);
    let rankHeight = bounce.height - (bounceBox.y + bounceBox.height);
    this.rankListArea.height = rankHeight;
    super.onResize();

  }

}
