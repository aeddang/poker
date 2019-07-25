import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Account from "ViewModel/account";
import * as Event from '../event'
import * as Config from "Util/config";


class UserBoxBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("user-box");
    cell.innerHTML = `
      <img id='${this.id}profileImg' class='profile-img'></img>
      <div class='profile-cover'></div>
      <div class='info'>
        <div id='${this.id}text' class='text' ></div>
        <div id='${this.id}desc' class='desc' ></div>
        <div id='${this.id}rank' class='rank' ></div>
      </div>
      <button id='${this.id}btn' class='btn'></button>
    `;
    this.body.appendChild(cell);
  }
}


export default class UserBox extends Component {
  constructor() {
    super();
    this.debuger.tag = 'UserBox';
  }

  remove() {
    super.remove();
    this.text = null;
    this.desc = null;
    this.rank = null;
    this.profileImg = null;
    this.btn = null;
  }

  getElementProvider() { return new UserBoxBody(this.body); }
  onCreate(elementProvider) {
    this.rank = elementProvider.getElement('rank');
    this.desc = elementProvider.getElement('desc');
    this.text = elementProvider.getElement('text');
    this.profileImg = elementProvider.getElement('profileImg');
    this.btn = elementProvider.getElement('btn');
    this.updateUserData();
  }

  setupEvent() {
    Account.loginModel.delegate.subscribe ( e => {
        if(e.type == Account.EVENT.ON_PROFILE || e.type == Account.EVENT.ON_LOGOUT) this.updateUserData();
    });

    this.attachEvent(this.btn, "click", e => {
      if( Account.loginModel.getStatus() != Account.Status.Login )Account.loginModel.login();
      else{ };
    });
  }

  updateUserData(){
    if( Account.loginModel.getStatus() != Account.Status.Login ){
      this.profileImg.src = "";
      this.rank.innerHTML = "";
      this.text.innerHTML = "";
      this.desc.innerHTML = "Login"
      return;
    }

    let info = Account.loginModel.getUserData();
    this.rank.innerHTML = info.rank+"st";
    this.text.innerHTML = info.name;
    this.desc.innerHTML = "$"+Util.numberWithCommas(info.bank);
    this.profileImg.src = info.profileImg;
  }

}
