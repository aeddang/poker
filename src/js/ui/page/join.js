import Room from 'Component/room';
import ElementProvider from 'Skeleton/elementprovider';
import { LoadingSpiner } from 'Skeleton/paint';
import * as Util from 'Skeleton/util';
import * as Config from 'Util/config';

class JoinBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("join");
    cell.innerHTML =`

    <div id='${this.id}chatArea' class='chat-area'></div>
    <div id='${this.id}infoBox' class='info-box'>
      <p id='${this.id}userInfoBox' class='user'></p>
      <button id='${this.id}btnPlay' class='btn-play'>play</button>
    </div>
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
    this.infoBox = null;
    this.chatArea = null;
    this.userInfoBox = null;
    this.loadingBar.remove();
    this.loadingBar = null;

  }

  getElementProvider() { return new JoinBody(this.body); }
  onCreate(elementProvider) {
    let loadingBarBody = elementProvider.getElement('loadingBar');
    let bounce = Util.convertRectFromDimension(loadingBarBody);
    this.loadingBar.init(loadingBarBody, bounce.width, bounce.height);
    this.btnPlay = elementProvider.getElement('btnPlay');
    this.infoBox = elementProvider.getElement('infoBox');
    this.userInfoBox = elementProvider.getElement('userInfoBox');
    this.chatArea = elementProvider.getElement('chatArea');
    this.chat.init(this.chatArea).subscribe ( this.onChatEvent.bind(this) );
    super.onCreate(elementProvider);
    this.onResize();
    this.join();
    this.onUpdateUserInfo()
  }

  setupEvent() {
    this.attachEvent(this.btnPlay, "click", this.onPlay.bind(this));
  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let bounceBox = Util.convertRectFromDimension(this.chatArea);
    this.infoBox.style.width = Util.getStyleUnit( bounce.width - bounceBox.width );
    super.onResize();
    this.chat.onResize();
  }

  onUpdateUserInfo() {
    this.userInfoBox.innerHTML =   this.userInfo.name + '<br>' +  this.userInfo.id;
  }

  join() {
    this.loadingBar.play()
    this.room = this.client.join("join", {
      accessToken: this.userInfo.accessToken,
      player: this.userInfo.name
    });
    this.initRoom();
  }

  onPlay() {

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
