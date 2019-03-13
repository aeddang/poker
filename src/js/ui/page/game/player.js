import SyncPropsComponent from 'Component/syncpropscomponent';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import { Action } from  "Util/command";


class PlayerBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("player");
    cell.classList.add("player-position-wait");
    cell.innerHTML = `

      <div class='profile'>
        <img id='${this.id}profileImg' class='profile-img'></img>
        <div class='info'>
          <p id='${this.id}name' class='name'></p>
          <p id='${this.id}bankroll' class='bankroll'></p>
          <p id='${this.id}networkStatus' class='networkStatus'></p>
        </div>
      </div>
      <div class='play-data'>
        <p id='${this.id}action' class='action'></p>
        <p id='${this.id}status' class='status'></p>
        <p id='${this.id}bat' class='bat'></p>
        <p id='${this.id}positionStatus' class='position-status'></p>
        <p id='${this.id}blind' class='blind'></p>
        <div id='${this.id}timeBar' class='time-bar'></div>
      </div>
      <div class='show-down'>
        <div id='${this.id}card0' class='card'></div>
        <div id='${this.id}card1' class='card'></div>
        <div id='${this.id}card2' class='card'></div>
        <div id='${this.id}card3' class='card'></div>
        <div id='${this.id}card4' class='card'></div>
      </div>
    `;
    this.body.appendChild(cell);
  }
}


const CARD_WIDTH = 30;
const CARD_HEIGHT = 50;

export default class Player extends SyncPropsComponent {
  constructor() {
    super();
    this.debuger.tag = 'Player';
    this.me = false;
    this.limitTime = 0;
    this.time = 0
    this.cards = [];
  }

  init(body, itsMe) {
    this.me = itsMe;
    return super.init(body);
  }
  remove() {
    super.remove();
    this.profileImg = null;
    this.name = null;
    this.bankroll = null;
    this.action = null;
    this.status = null;
    this.bat = null;
    this.positionStatus = null;
    this.blind = null;
    this.timeBar = null;
    this.cards = null;
    this.networkStatus = null;
  }

  setupWatchs(){
    this.watchs = {
      name: value =>{
        this.name.innerHTML = value;
      },
      position: value =>{
        if( value != -1 ) this.onGameJoin();
      },
      bankroll: value =>{
        this.bankroll.innerHTML = 'Bankroll -> ' + value;
      },
      status: value =>{
        switch ( value ) {
          case Status.Wait:
            this.status.innerHTML = 'Wait'
            break;
          case Status.Impossible:
            this.status.innerHTML = 'Impossible'
            break;
          case Status.Fold:
            this.status.innerHTML = 'Fold'
            break;
          case Status.Play:
            this.status.innerHTML = 'Play'
            break;
          case Status.AllIn:
            this.status.innerHTML = 'AllIn'
            break;
          case Status.ShowDown:
            this.status.innerHTML = 'ShowDown'
            break;
          case Status.Absence:
            this.status.innerHTML = 'Absence'
            break;
          case Status.WaitBigBlind:
            this.status.innerHTML = 'WaitBigBlind'
            break;
        }
      },
      gameBat: value =>{
        this.bat.innerHTML = 'GameBat -> ' + value;
      },
      time: value =>{
        this.time = value;
        if(this.limitTime > 0) this.timeBar.style.width =  Util.getStyleRatio( this.time/ this.limitTime * 100 );
      },
      limitTime: value =>{
        this.limitTime = value;
      },
      isBlind: value =>{
        this.blind.innerHTML = value ? 'BlindPlay' : '';
      },
      isWinner: value =>{
        this.action.innerHTML = value  ? 'Win' : '';
      },

      isActive: value =>{
        value ? this.getBody().classList.add("player-active") : this.getBody().classList.remove("player-active")
      },
      finalAction: value =>{
        switch ( value ) {
          case Action.Fold:
            this.action.innerHTML = 'Fold'
            break;
          case Action.SmallBlind:
            this.action.innerHTML = 'SmallBlind'
            break;
          case Action.BigBlind:
            this.action.innerHTML = 'BigBlind'
            break;
          case Action.Check:
            this.action.innerHTML = 'Check'
            break;
          case Action.Call:
            this.action.innerHTML = 'Call'
            break;
          case Action.Bat:
            this.action.innerHTML = 'Bat'
            break;
          case Action.Raise:
            this.action.innerHTML = 'Raise'
            break;
          case Action.AllIn:
            this.action.innerHTML = 'AllIn'
            break;
        }
      },
      networkStatus: value =>{
        switch ( value ) {
          case NetworkStatus.Connected:
            this.networkStatus.innerHTML = 'Connected'
            break;
          case NetworkStatus.DisConnected:
            this.networkStatus.innerHTML = 'DisConnected'
            break;
          case NetworkStatus.Wait:
            this.networkStatus.innerHTML = 'Wait'
            break;
        }
      },
      positionStatus: value =>{
        switch ( value ) {
          case PositionStatus.DeallerButton:
            this.positionStatus.innerHTML = 'DB'
            break;
          case PositionStatus.BigBlind:
            this.positionStatus.innerHTML = 'BB'
            break;
          case PositionStatus.SmallBlind:
            this.positionStatus.innerHTML = 'SB'
            break;
          case PositionStatus.None:
            this.positionStatus.innerHTML = ''
            break;
        }
      },

    };
  }

  getElementProvider() { return new PlayerBody(this.body); }
  onCreate(elementProvider) {
    this.profileImg = elementProvider.getElement('profileImg');
    this.name = elementProvider.getElement('name');
    this.bankroll = elementProvider.getElement('bankroll');
    this.networkStatus = elementProvider.getElement('networkStatus');
    this.action = elementProvider.getElement('action');
    this.status = elementProvider.getElement('status');
    this.bat = elementProvider.getElement('bat');
    this.positionStatus = elementProvider.getElement('positionStatus');
    this.blind = elementProvider.getElement('blind');
    this.timeBar = elementProvider.getElement('timeBar');

    if ( this.me ) this.getBody().classList.add("player-me");
    for(var i=0; i<5; ++i) {
      let card = elementProvider.getElement('card'+i);
      card.width = CARD_WIDTH;
      card.height = CARD_HEIGHT;
      this.cards.push(card);
    }
  }

  onGameJoin( ) {
    this.getBody().classList.remove("player-position-wait");
    this.getBody().classList.add("player-position-join");
  }

  showCard( id, cardData ) {
    let idx = Number(id);
    let card = this.cards[ idx ];
    card.innerHTML = cardData.suit + " : " + cardData.num;
    card.x = idx * CARD_WIDTH;
    card.visible = true;
  }

  hideCard( id ) {
    let idx = Number(id);
    let card = this.cards[ idx ];
    card.innerHTML = 'hidden';
    card.x = 0;
    card.visible = false;
  }
}


export const Status = Object.freeze ({
  Wait: 1,
  Impossible: 2,
  Fold: 3,
	Play: 4,
  AllIn: 5,
  ShowDown: 6,
  Absence: 7,
  WaitBigBlind: 8
});

const PositionStatus= Object.freeze ({
  None: 1,
  DeallerButton: 2,
  SmallBlind: 3,
  BigBlind: 4
});

export const NetworkStatus = Object.freeze ({
  Connected: 1,
  DisConnected: 2,
  Wait: 3
});
