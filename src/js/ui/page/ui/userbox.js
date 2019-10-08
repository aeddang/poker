import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Account from "ViewModel/account";
import * as Config from "Util/config";
import * as ImageFactory from 'Util/imagefactory';
import * as MessageBoxController from 'Component/messagebox';

class UserBoxBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("user-box");
    cell.innerHTML = `
      <img id='${this.id}profileImg' class='profile-img'></img>
      <div class='info'>
        <div id='${this.id}text' class='text' ></div>
        <button id='${this.id}btn' class='btn'></button>
      </div>
      <img id='${this.id}lv' class='lv'></img>
      <img id='${this.id}rank' class='rank' ></img>

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
    this.lv = null;
    this.rank = null;
    this.profileImg = null;
    this.btn = null;
  }

  getElementProvider() { return new UserBoxBody(this.body); }
  onCreate(elementProvider) {
    this.rank = elementProvider.getElement('rank');
    this.lv = elementProvider.getElement('lv');
    this.text = elementProvider.getElement('text');
    this.profileImg = elementProvider.getElement('profileImg');
    this.btn = elementProvider.getElement('btn');
    this.updateUserData();
  }

  setupEvent() {
    Account.loginModel.delegate.subscribe ( e => {
      switch(e.type){
        case Account.EVENT.ON_PLAY_DATA :
        case Account.EVENT.ON_LOGOUT :
          this.updateUserData();
          break;
        case Account.EVENT.ON_PROFILE :
          Account.loginModel.getPlayData();
          break;
        case Account.EVENT.ON_UNREGISTERED :
          this.openSelectCharacter();
          break;
        case Account.EVENT.ERROR :
          MessageBoxController.instence.alert("",ErrorAlert.DisableLogin);
          break;
      }
    });

    this.attachEvent(this.btn, "click", e => {
      if( Account.loginModel.getStatus() != Account.Status.Login )Account.loginModel.login();
      else Account.loginModel.getPlayData();
    });
  }

  openSelectCharacter(){
    window.Poker.openPopup(Config.Popup.Join).subscribe (  e =>{
        Account.loginModel.signUp(e.data);
    });
  }

  updateUserData(){
    if( Account.loginModel.getStatus() != Account.Status.Login ){
      this.profileImg.src = ImageFactory.DEFAULT_CHARACTER;
      this.lv.visible = false;
      this.rank.src = ImageFactory.DEFAULT_RANK_GROUP;
      this.text.innerHTML = "Login";
      return;
    }

    let info = Account.loginModel.getUserData();
    this.text.innerHTML = info.name+"<br>$"+Util.numberWithCommas(info.bank);
    this.rank.src = ImageFactory.getMyRankGroup(info.rankId);
    this.profileImg.src = ImageFactory.getMyCharacter(info.character);
    this.lv.src = ImageFactory.getMyLvTitle(info.bank);
    this.lv.visible = true;
  }

}
