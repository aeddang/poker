import Room from 'Component/room';
import ElementProvider from 'Skeleton/elementprovider';
import { LoadingSpiner } from 'Skeleton/paint';
import * as Util from 'Skeleton/util';
import * as Config from 'Util/config';
import * as SoundFactory from 'Root/soundfactory';

class JoinBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("join");
    cell.innerHTML =`
    <div class ='logo-center'></div>
    <div id='${this.id}infoBox' class='info-box'>
      <img id='${this.id}profileImg' class='profile-image'></img>
      <div class='info'>
        <p id='${this.id}name' class='name'></p>
        <p id='${this.id}bankroll' class='bankroll'></p>
      </div>
      <button id='${this.id}btnPlay' class='btn-play'>START</button>
    </div>
    <div id='${this.id}chatArea' class='chat-area'></div>
    <div id='${this.id}loadingBar' class='loading-bar'></div>
    `;
    this.body.appendChild(cell);
  }
}

class JoinInfo {
  constructor() {
    this.reset();
  }
  reset() {}
}

export default class Join extends Room {
  constructor() {
    super();
    this.ROOM_KEY = 'join';
    this.info = new JoinInfo();
    this.btnPlay = null;
    this.infoBox = null;
    this.chatArea = null;
    this.userInfoBox = null;
    this.loadingBar = new LoadingSpiner();
  }

  remove() {
    super.remove();
    this.info = null;
    this.btnPlay = null;
    this.name = null;
    this.bankroll = null;
    this.chatArea = null;
    this.userInfoBox = null;
    this.loadingBar.remove();
    this.loadingBar = null;
    this.profileImg = null;
  }

  getElementProvider() { return new JoinBody(this.body); }
  onCreate(elementProvider) {
    SoundFactory.getInstence().stopBgm();
    let loadingBarBody = elementProvider.getElement('loadingBar');
    let bounce = Util.convertRectFromDimension(loadingBarBody);
    this.loadingBar.init(loadingBarBody, bounce.width, bounce.height);
    this.btnPlay = elementProvider.getElement('btnPlay');
    this.infoBox = elementProvider.getElement('infoBox');
    this.name = elementProvider.getElement('name');
    this.bankroll = elementProvider.getElement('bankroll');
    this.chatArea = elementProvider.getElement('chatArea');
    this.chat.init(this.chatArea).subscribe ( this.onChatEvent.bind(this) );
    this.profileImg = elementProvider.getElement('profileImg');
		this.profileImg.src = "./static/resource/obj_alien1.png"
    super.onCreate(elementProvider);
    this.onResize();
    this.join();
    this.onUpdateUserInfo()
  }

  setupEvent() {
    this.attachEvent(this.btnPlay, "click", this.onPlay.bind(this));
  }

  onResize() {
    /*
    let bounce = Util.convertRectFromDimension(this.getBody());
    let bounceBox = Util.convertRectFromDimension(this.chatArea);
    this.infoBox.width =  bounce.width - bounceBox.width;
    */
    super.onResize();
    this.chat.onResize();
  }

  onUpdateUserInfo() {
    this.name.innerHTML =   this.userInfo.name + '<br>' +  this.userInfo.id;
    this.bankroll.innerHTML = "$1000";
  }

  join() {
    this.loadingBar.play();
    super.join();
  }

  onPlay() {
    SoundFactory.getInstence().playBgm(SoundFactory.BGM.DEFAULT);
    Poker.onPageChange(Config.Page.Play);
  }

  onJoin() {
    super.onJoin();
    this.loadingBar.stop();
  }

  onMessage(message) {
    super.onMessage(message);
  }

  onError(error) {
    super.onError(error);
    this.loadingBar.stop();
  }



}
