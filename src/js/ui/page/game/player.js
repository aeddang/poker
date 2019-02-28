import Component from 'Skeleton/component';
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

export default class Player extends Component {
  constructor() {
    super();
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

  getElementProvider() { return new PlayerBody(this.body); }
  onCreate(elementProvider) {
    this.profileImg = elementProvider.getElement('profileImg');
    this.profileData = elementProvider.getElement('profileData');
    this.playData = elementProvider.getElement('playData');
    this.status = elementProvider.getElement('status');
    this.timeBar = elementProvider.getElement('timeBar');
    this.profileData.innerHTML = this.idx + ' : player'
  }

  onUpdateProp(prop, value){
    console.log( prop + ' -> ' + value );
    switch( prop ){
      case 'status' :  break;
      case 'bankroll' : break;
      case 'isBlind' : break;
      case 'Hand' : break;
      case 'data' : break;
    }
  }
}
