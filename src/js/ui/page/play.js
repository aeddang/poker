import Room from 'Component/room';
import ElementProvider from 'Skeleton/elementprovider';
import { LoadingSpiner } from 'Skeleton/paint';
import * as Util from 'Skeleton/util';
import * as Config from 'Util/config';
import * as Game from './game/game';
import Command, * as Cmd from  "Util/command";

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
    this.players = [];
  }
  reset() {}
}

export default class Play extends Room {
  constructor() {
    super();
    this.ROOM_KEY= "play";
    this.info = new PlayInfo();
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
    this.me = null;
  }

  getElementProvider() { return new PlayBody(this.body); }
  onCreate(elementProvider) {
    let loadingBarBody = elementProvider.getElement('loadingBar');
    let bounce = Util.convertRectFromDimension(loadingBarBody);
    this.loadingBar.init(elementProvider.getElement('loadingBar'));
    this.gameViewer.init(elementProvider.getElement('gameViewer'));

    this.btnExit = elementProvider.getElement('btnExit');
    this.playArea = elementProvider.getElement('playArea');
    this.chatArea = elementProvider.getElement('chatArea');
    this.chat.init(this.chatArea).subscribe ( this.onChatEvent.bind(this) );

    this.playerViewer.init(elementProvider.getElement('playerViewer')).subscribe ( this.onUiEvent.bind(this) );
    this.uiBox.init(elementProvider.getElement('uiBox')).subscribe ( this.onUiEvent.bind(this) );
    super.onCreate(elementProvider);
    this.onResize();
    this.join();
  }
  setupEvent() {
    this.attachEvent(this.btnExit, "click", this.onExit.bind(this));

    this.room.listen("maxPlayer", e => {
      this.playerViewer.onUpdateSyncProp("maxPlayer", e.value);
    });
    this.room.listen("dealler/burnCards/:id", e => {
      if (e.operation === "add") this.gameViewer.burnCard(e.path.id, e.value);
      else if (e.operation === "remove") this.gameViewer.hideCard(e.path.id);
    });
    this.room.listen("stage", e => {
      this.gameViewer.onUpdateSyncProps(e.value);
    });
    this.room.listen("stage/:attribute", e => {
      this.gameViewer.onUpdateSyncProp (e.path.attribute, e.value);
    });

    this.room.listen("players/:id", e => {
      this.debuger.log(e , 'players');
      if (e.operation === "add") {
        let itsMe = this.userInfo.id == e.value.userId;
        if( itsMe ) {
          this.me = e.path.id;
          this.uiBox.onUpdateSyncProps(e.value);
        }
        this.playerViewer.onJoin(e.path.id, e.value, itsMe);
      }
      else if (e.operation === "remove") { this.playerViewer.onLeave(e.path.id, e.value); }
    });

    this.room.listen("players/:id/:attribute", e => {
      this.playerViewer.onUpdatePlayer(e.path.id, e.path.attribute, e.value);
      if(e.path.id == this.me) {
        this.uiBox.onUpdateSyncProp (e.path.attribute, e.value);
        if( e.path.attribute == "mainPot") this.gameViewer.addSidePot( e.value );
      }
    });

    this.room.listen("players/:id/openHand/:idx", e => {
      if (e.operation === "add") this.playerViewer.onShowCard(e.path.id, e.path.idx, e.value);
      else if (e.operation === "remove") this.playerViewer.onHideCard(e.path.id, e.path.idx);
    });
  }

  onPush(data) {
    this.uiBox.pushHand(data);
  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let bounceBox = Util.convertRectFromDimension(this.chatArea);
    this.playArea.width = bounce.width - bounceBox.width;
    super.onResize();
    this.chat.onResize();
    this.gameViewer.onResize();
    this.playerViewer.onResize();
    this.uiBox.onResize();
  }

  onUiEvent(event) {
    this.debuger.log(event, 'onUiEvent');
    let command = new Command (
      Cmd.CommandType.Action,
      event.type,
      event.data
    );
    this.room.send({ message: command });
  }

  join() {
    this.loadingBar.play();
    super.join();
  }

  onJoin() {
    super.onJoin();
    this.loadingBar.stop();
  }

  onExit() {
    Poker.onPageChange(Config.Page.Join);
  }

  onMessage(message) {
    super.onMessage(message);
  }

  onError(error) {
    super.onError(error);
    this.loadingBar.stop();
    this.onExit();
  }



}
