import Room from 'Component/room';
import ElementProvider from 'Skeleton/elementprovider';
import { LoadingSpiner } from 'Skeleton/paint';
import * as Util from 'Skeleton/util';
import * as Config from 'Util/config';
import * as Game from './game/game';
import TopNavi from 'Component/topnavi';
import Command, * as Cmd from  "Util/command";
import * as SoundFactory from 'Root/soundfactory';
import * as MessageBoxController from 'Component/messagebox';
import { ErrorAlert } from  "Util/message";

class PlayBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("play");
    cell.innerHTML =`
    <div id='${this.id}playArea' class='play-area'>
      <div id='${this.id}gameViewer' class='game-viewer'></div>
      <div id='${this.id}cardShow' class='card-show'></div>
      <div id='${this.id}playerViewer' class='player-viewer'></div>
      <div id='${this.id}uiBox' class='ui-box'></div>
      <div class ='logo'></div>
    </div>
    <button id='${this.id}btnChip' class='btn-chip'></button>
    <div id='${this.id}topNaviArea' class='top-navi-area'></div>
    <div id='${this.id}chatArea' class='chat-area'></div>
    <div id='${this.id}loadingBar' class='loading-bar'></div>
    `;
    this.body.appendChild(cell);
  }
}

const CARD_WIDTH = 50;
const CARD_HEIGHT = 75;
const CARD_MARGIN = 3;
const BOTTOM_HEIGHT = 0;
const BOTTOM_MARGIN = 20;
class PlayInfo {
  constructor() {
    this.reset();
    this.players = [];
    this.me = null;
  }
  reset() {}
}

export default class Play extends Room {
  constructor() {
    super();
    this.ROOM_KEY= "play";
    this.info = new PlayInfo();
    this.gameViewer = new Game.GameViewer(CARD_WIDTH, CARD_HEIGHT, CARD_MARGIN);
    this.playerViewer = new Game.PlayerViewer();
    this.cardShow = new Game.CardShow(CARD_WIDTH, CARD_HEIGHT, CARD_MARGIN);
    this.uiBox = new Game.UiBox();
    this.topNavi = new TopNavi();
    this.loadingBar = new LoadingSpiner();
  }

  remove() {
    super.remove();
    this.info = null;
    this.topNavi.remove();
    this.loadingBar.remove();
    this.gameViewer.remove();
    this.playerViewer.remove();
    this.uiBox.remove();
    this.cardShow.remove();
    this.chatArea = null;
    this.loadingBar = null;
    this.gameViewer = null;
    this.playerViewer = null;
    this.uiBox = null;
    this.topNavi = null;
    this.cardShow = null;
    this.btnchip = null;
  }

  getElementProvider() { return new PlayBody(this.body); }
  onCreate(elementProvider) {
    SoundFactory.getInstence().playBgm(SoundFactory.BGM.DEFAULT);
    let loadingBarBody = elementProvider.getElement('loadingBar');
    let bounce = Util.convertRectFromDimension(loadingBarBody);
    this.loadingBar.init(elementProvider.getElement('loadingBar'));
    this.gameViewer.init(elementProvider.getElement('gameViewer'));
    this.btnChip = elementProvider.getElement('btnChip');
    this.playArea = elementProvider.getElement('playArea');
    this.chatArea = elementProvider.getElement('chatArea');
    this.chat.init(this.chatArea).subscribe ( this.onChatEvent.bind(this) );
    this.topNavi.init(elementProvider.getElement('topNaviArea'));
    this.playerViewer.init(elementProvider.getElement('playerViewer')).subscribe ( this.onUiEvent.bind(this) );
    this.uiBox.init(elementProvider.getElement('uiBox')).subscribe ( this.onUiEvent.bind(this) );
    this.cardShow.init(elementProvider.getElement('cardShow')).subscribe ( this.onShowEvent.bind(this) );
    super.onCreate(elementProvider);
    this.onResize();
    this.join();
  }

  setupEvent() {
    this.attachEvent(this.btnChip, "click", e => {} );

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
      if( e.path.attribute == "status") this.onGameStatusChange(e.value);
      this.gameViewer.onUpdateSyncProp (e.path.attribute, e.value);
    });

    this.room.listen("players/:id", e => {
      //this.debuger.log(e , 'players');
      if (e.operation === "add") {
        let itsMe = this.userInfo.id == e.value.userId;
        let player = this.playerViewer.onJoin(e.path.id, e.value, itsMe);
        if( itsMe ) {
          this.info.me = e.path.id;
          this.uiBox.onJoin(player);
          this.uiBox.onUpdateSyncProps(e.value);
        }

      }
      else if (e.operation === "remove") { this.playerViewer.onLeave(e.path.id, e.value); }
    });

    this.room.listen("players/:id/:attribute", e => {
      this.playerViewer.onUpdatePlayer(e.path.id, e.path.attribute, e.value);
      if(e.path.id == this.info.me) {
        this.uiBox.onUpdateSyncProp (e.path.attribute, e.value);
        if( e.path.attribute == "mainPot") this.gameViewer.addSidePot( e.value );
      }
    });
    this.room.listen("players/:id/openHand/:idx", e => {
      if (e.operation === "add") {
        if(e.path.id == this.info.me) { this.uiBox.onOpenCard(e.path.idx, e.value); }
        else { this.playerViewer.onOpenCard(e.path.id, e.path.idx, e.value); }
      }
    });
    this.room.listen("players/:id/madeHand/:idx", e => {
      if (e.operation === "add") {
        if( this.gameViewer.onShowCard( e.value ) == false ) {
          if(e.path.id == this.info.me) { this.uiBox.onShowCard(e.path.idx, e.value); }
          else { this.playerViewer.onShowCard(e.path.id, e.path.idx, e.value); }
        }
      }
      else if (e.operation === "remove") this.playerViewer.onHideCard(e.path.id, e.path.idx);
    });
  }

  onPush(data) {
    this.uiBox.onPushHand(data);
  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let bounceBox = Util.convertRectFromDimension(this.chatArea);
    let margin = bounceBox.y - bounce.y + BOTTOM_MARGIN;
    this.chatArea.height = bounce.height - margin;
    let gameHeight = bounce.height - BOTTOM_HEIGHT;
    this.gameViewer.getBody().height = gameHeight;
    this.playerViewer.getBody().height = gameHeight;
    this.cardShow.getBody().height = gameHeight;
    super.onResize();
    this.chat.onResize();
    this.gameViewer.onResize();
    this.playerViewer.onResize();
    this.uiBox.onResize();
    this.cardShow.onResize();
  }

  onGameStatusChange( status ){
    switch ( status ) {
      case Game.Status.Wait:
        this.gameViewer.detachCard();
        this.cardShow.discard(this.gameViewer.getCardPositions(), this.playerViewer.getPlayerPositions()) ;
        break;
      case Game.Status.FreeFlop:
        this.cardShow.shuffle(this.gameViewer.getCardPositions(), this.playerViewer.getPlayerPositions()) ;
        break;
      case Game.Status.Flop:
        break;
      case Game.Status.Turn:
        break;
      case Game.Status.ShowDown:
        break;
    }
  }

  onShowEvent( event ) {
    this.debuger.log(event.type, 'event.type');
    switch( event.type ){
      case Game.SHOW_EVENT.SHUFFLE_COMPLETED:
        this.debuger.log(Game.SHOW_EVENT.SHUFFLE_COMPLETED, 'attachCard');
        this.gameViewer.attachCard();
        break;
      case Game.SHOW_EVENT.DISCARD_COMPLETED:
        break;
    }
  }

  onUiEvent(event) {
    this.debuger.log(event, 'onUiEvent');
    switch( event.type ){
      case Game.POSITION_EVENT.SELECTED_POSITION:
        this.uiBox.onSelectedPosition( event.data );
        return;
      case Game.POSITION_EVENT.MOVE_POSITION:
        this.uiBox.onMovePosition( event.data );
        return;
    }
    if(this.uiBox.info.isSelectedPlayer == true && event.type == Game.POSITION_EVENT.JOIN_GAME ) return;

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

  onMessage(message) {
    let bro = super.onMessage(message);
    if(bro == null) return;
    if(bro.senderId == null || bro.senderId == undefined) return;
    this.playerViewer.onChatPlayer(bro);
  }

  onError(error) {
    super.onError(error);
    this.loadingBar.stop();
    MessageBoxController.instence.alert("",ErrorAlert.DisableGame);
    Poker.pageChange(Config.Page.Home);
  }

}
