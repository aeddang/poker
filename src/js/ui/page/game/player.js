import SyncPropsComponent from 'Component/syncpropscomponent';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';

class PlayerBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("player");
    cell.innerHTML = `
      <img id='${this.id}profileImg' class='profile-img'></img>
      <p id='${this.id}profileData' class='profile-data'></p>
      <p id='${this.id}playData' class='play-data'></p>
      <p id='${this.id}status' class='status'></p>
      <div id='${this.id}timeBar' class='time-bar'></div>
    `;
    this.body.appendChild(cell);
  }
}

export default class Player extends SyncPropsComponent {
  constructor() {
    super();
    this.debuger.tag = 'Player';
    this.idx = -1;
  }

  init(body,idx) {
    this.idx = idx;
    return super.init(body);
  }
  remove() {
    super.remove();
    this.profileImg = null;
    this.profileData = null;
    this.playData = null;
    this.status = null;
    this.timeBar = null;
  }

  setupSyncProps(){
    this.syncProps = {
      status:-1,
      bankroll:0,
      isBlind:false,
      userId:'',
      nick:'',
      position:-1,
      isActive:false,
      networkStatus:-1
    };
    this.watchs = {
      status: value =>{
        this.debuger.log(value, 'status');
      },
      bankroll: value =>{
        this.debuger.log(value, 'bankroll');
      },
      isBlind: value =>{
        this.debuger.log(value, 'isBlind');
      },
      userId: value =>{
        this.debuger.log(value, 'userId');
      },
      nick: value =>{
        this.debuger.log(value, 'nick');
      },
      position: value =>{
        this.debuger.log(value, 'position');
      },
      isActive: value =>{
        this.debuger.log(value, 'isActive');
      },
      networkStatus: value =>{
        this.debuger.log(value, 'networkStatus');
      },
    };
    super.setupSyncProps();
  }

  getElementProvider() { return new PlayerBody(this.body); }
  onCreate(elementProvider) {
    this.profileImg = elementProvider.getElement('profileImg');
    this.profileData = elementProvider.getElement('profileData');
    this.playData = elementProvider.getElement('playData');
    this.status = elementProvider.getElement('status');
    this.timeBar = elementProvider.getElement('timeBar');
    this.profileData.innerHTML = this.idx + ' : player out'
  }

  onJoin( syncProps ) {
    this.onUpdateSyncProps( syncProps );
    this.profileData.innerHTML = this.idx + ' : player in'
  }

  onLeave() {
    this.profileData.innerHTML = this.idx + ' : player out'
  }
}


export const Status = Object.freeze ({
  Wait: 1,
  Impossible: 2,
  Fold: 3,
	Play: 4,
  AllIn: 5
});

export const NetworkStatus = Object.freeze ({
  Connected: 1,
  DisConnected: 2,
  Wait: 3
});
