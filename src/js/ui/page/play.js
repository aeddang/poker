import Room from 'Component/room';
import ElementProvider from 'Skeleton/elementprovider';
import { LoadingSpiner } from 'Skeleton/paint';
import * as Util from 'Skeleton/util';
import * as Config from 'Util/config';
import * as Game from './game/game';

class PlayBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("play");
    cell.innerHTML =`
    <div id='${this.id}chatArea' class='chat-area'></div>
    <div id='${this.id}playArea' class='play-area'>
      <div id='${this.id}gameViewer' class='game-viewer'></div>
      <div id='${this.id}playerViewer' class='player-viewer'></div>
      <div id='${this.id}uiBox' class='ui-box'></div>
      <button id='${this.id}btnExit' class='btn-exit'>exit</button>
    </div>
    <div id='${this.id}loadingBar' class='loading-bar'></div>
    `;
    this.body.appendChild(cell);
  }
}

class PlayInfo {
  constructor() {
    this.reset();
  }
  reset() {}
}

export default class Play extends Room {
  constructor() {
    super();
    this.ROOM_KEY= "game";
    this.info = new PlayInfo();
    this.btnExit = null;
    this.playArea = null;
    this.chatArea = null;
    this.gameViewer = new Game.GameViewer();
    this.playerViewer = new Game.PlayerViewer();
    this.uiBox = new Game.UiBox();
    this.loadingBar = new LoadingSpiner();
  }

  remove() {
    super.remove();
    this.info = null;
    this.btnExit = null;
    this.chatArea = null;
    this.loadingBar.remove();
    this.gameViewer.remove();
    this.playerViewer.remove();
    this.uiBox.remove();
    this.loadingBar = null;
    this.gameViewer = null;
    this.playerViewer = null;
    this.uiBox = null;

  }

  getElementProvider() { return new PlayBody(this.body); }
  onCreate(elementProvider) {
    let loadingBarBody = elementProvider.getElement('loadingBar');
    let bounce = Util.convertRectFromDimension(loadingBarBody);
    this.loadingBar.init(elementProvider.getElement('loadingBar'));
    this.gameViewer.init(elementProvider.getElement('gameViewer'));
    this.playerViewer.init(elementProvider.getElement('playerViewer'));
    this.btnExit = elementProvider.getElement('btnExit');
    this.playArea = elementProvider.getElement('playArea');
    this.chatArea = elementProvider.getElement('chatArea');
    this.chat.init(this.chatArea).subscribe ( this.onChatEvent.bind(this) );
    this.uiBox.init(elementProvider.getElement('uiBox')).subscribe ( this.onUiEvent.bind(this) );

    super.onCreate(elementProvider);
    this.onResize();
    this.join();
    this.onUpdateUserInfo()
  }

  setupEvent() {
    this.attachEvent(this.btnExit, "click", this.onExit.bind(this));
    this.room.listen("players/:id", e => {
      if (e.operation === "add") {
        console.log( e.path.data );
      } else if (e.operation === "remove") {

      }
    });

    this.room.listen("players/:id/:prop", e => {
      console.log( e.path.id + ' -> ' + e.path.isReady );
    });

  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let bounceBox = Util.convertRectFromDimension(this.chatArea);
    this.playArea.style.width = Util.getStyleUnit( bounce.width - bounceBox.width );
    super.onResize();
    this.chat.onResize();
    this.gameViewer.onResize();
    this.playerViewer.onResize();
    this.uiBox.onResize();
  }

  onUiEvent(event) {
    let command = new Command (
      Cmd.CommandType.Action,
      event.type,
      event.data
    );
    this.room.send({ message: command });
  }

  onUpdateUserInfo() {

  }

  join() {
    this.loadingBar.play()
    this.room = this.client.join(this.ROOM_KEY, {
      player: this.userInfo
    });
    this.initRoom();
  }

  onJoin() {
    super.onJoin();
    this.loadingBar.stop();
  }

  onExit() {

  }

  onMessage(message) {
    super.onMessage(message);
  }

  onError(error) {
    super.onError(error);
    this.loadingBar.stop();
  }



}
