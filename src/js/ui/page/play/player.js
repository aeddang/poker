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
    this.profileImg = null;
    this.profile = null;
    this.playData = null;
    this.status = null;
    this.timeBar = null;
  }

  remove() {
    super.remove();
    this.profileImg = null;
    this.profile = null;
    this.playData = null;
    this.status = null;
    this.timeBar = null;

  }

  getElementProvider() { return new PlayBody(this.body); }
  onCreate(elementProvider) {
    this.profileImg = elementProvider.getElement('profileImg');
    this.profile = elementProvider.getElement('profile');
    this.playData = elementProvider.getElement('playData');
    this.status = elementProvider.getElement('status');
    this.timeBar = elementProvider.getElement('timeBar');
  }

  onUpdateStatus(status){

  }
}
