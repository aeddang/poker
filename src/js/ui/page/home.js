import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Account from "ViewModel/account";
import TopNavi from 'Component/topnavi';
import RoomList from './room/roomlist/roomlist';
import RankList from './room/ranklist/ranklist';
import UserBox from './room/userbox/userbox';
import * as RoomEvent from './room/event'
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

    <button id='${this.id}btnChip' class='btn-chip'></button>
    `;
    this.body.appendChild(cell);
  }
}

export default class Home extends Component {
  constructor() {
    super();
    this.topNavi = new TopNavi();
    this.roomList = new RoomList();
    this.rankList = new RankList();
    this.userBox = new UserBox();
  }

  init(body, client, options) {
    return super.init(body, client, options);
  }

  remove() {
    super.remove();
    this.userBox.remove();
    this.roomList.remove();
    this.rankList.remove();
    this.topNavi.remove();
    this.topNavi = null;
    this.btnchip = null;
    this.userBox = null;
    this.userBoxArea = null;
    this.rankListArea = null;
  }

  getElementProvider() { return new HomeBody(this.body); }
  onCreate(elementProvider) {
    SoundFactory.getInstence().stopBgm();
    this.userBoxArea = elementProvider.getElement('userBoxArea');
    this.rankListArea = elementProvider.getElement('rankListArea');
    this.userBox.init(this.userBoxArea);
    this.topNavi.init(elementProvider.getElement('topNaviArea'));
    this.roomList.init(elementProvider.getElement('roomListArea'));
    this.rankList.init(this.rankListArea);
    this.btnChip = elementProvider.getElement('btnChip');
    super.onCreate(elementProvider);
    this.onResize();
  }

  setupEvent() {
    this.attachEvent(this.btnChip, "click", e => {} );
  }


  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let bounceBox = Util.convertRectFromDimension(this.userBoxArea);
    let rankHeight = bounce.height - (bounceBox.y + bounceBox.height);
    this.rankListArea.height = rankHeight;
    super.onResize();
  }

}
