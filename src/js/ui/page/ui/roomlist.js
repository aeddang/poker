import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Account from "ViewModel/account";
import * as Config from "Util/config";
import * as MessageBoxController from 'Component/messagebox';
import * as ImageFactory from 'Util/imagefactory';

class RoomListBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("room-list");
    this.body.appendChild(cell);
  }
}

class ListItemBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("item");
    cell.innerHTML = `
      <img id='${this.id}iconLv' class='icon-lv'></img>
      <div  class='text-box'>
        <img id='${this.id}textLv' class='text-lv'></img>
        <div id='${this.id}text' class='text' ></div>
      </div>
      <div id='${this.id}dimed' class='dimed'></div>
      <div id='${this.id}iconRock' class='icon-rock' ></div>
			<button id='${this.id}btn' class='btn'></button>
    `;
    this.body.appendChild(cell);
  }
}

class ListData {
  constructor(lv, minBank,port) {
    this.lv = lv;
    this.minBank = minBank;
    this.port = port;
    this.isAble = false;
  }
}

export default class RoomList extends Component {
  constructor() {
    super();
    this.datas = [];
    this.datas.push(new ListData(4,Config.MinBank.Lv4, Config.Port.Lv4));
    this.datas.push(new ListData(3,Config.MinBank.Lv3, Config.Port.Lv3));
    this.datas.push(new ListData(2,Config.MinBank.Lv2, Config.Port.Lv2));
    this.datas.push(new ListData(1,Config.MinBank.Lv1, Config.Port.Lv1));
  }

  remove() {
    super.remove();
  }

  getElementProvider() { return new RoomListBody(this.body); }
  onCreate(elementProvider) {
    this.onCreateListItem();
  }

  onCreateListItem(){
    let scollBody = this.getBody();
    this.datas.forEach( (data) => {
      let item = new ListItem()
      item.data = data;
      item.init( scollBody ).subscribe ( e => { this.delegate.next(e) } );
    });
    scollBody.scrollTop = scollBody.scrollHeight - scollBody.clientHeight;
  }
}

class ListItem extends Component {
  constructor() {
    super();
  }

  remove() {
    super.remove();
    this.data = null;
    this.text = null;
    this.iconRock = null;
    this.iconLv = null;
    this.textLv = null;
    this.dimed = null;
    this.btn = null;
  }

  getElementProvider() { return new ListItemBody(this.body); }
  onCreate(elementProvider) {
    this.text = elementProvider.getElement('text');
    this.iconRock = elementProvider.getElement('iconRock');
    this.iconLv = elementProvider.getElement('iconLv');
    this.textLv = elementProvider.getElement('textLv');
    this.dimed = elementProvider.getElement('dimed');
    this.btn = elementProvider.getElement('btn');
    this.text.innerHTML = "min bank $"+Util.numberWithCommas(this.data.minBank);
    this.getBody().classList.add("lv" + this.data.lv);
    this.iconLv.src = ImageFactory.getLvIcon(this.data.lv);
    this.textLv.src = ImageFactory.getLvTitle(this.data.lv);
    this.updateUserData();
  }

  setupEvent() {
    Account.loginModel.delegate.subscribe ( e => {
        if(e.type == Account.EVENT.ON_PLAY_DATA || e.type == Account.EVENT.ON_LOGOUT) this.updateUserData();
    } );

    this.attachEvent(this.btn, "click", e => {
       if( Account.loginModel.getStatus() != Account.Status.Login ){
          if(confirm(Confirm.NeedLogin) == true) Account.loginModel.login();
          return;
       }
       if(!this.data.isAble){
         MessageBoxController.instence.alert("",UiAlert.DisableLv);
         return;
       }
       window.Poker.createClient(this.data.port);
    } );
  }

  updateUserData(){
    let info = Account.loginModel.getUserData();
    if(info.bank >= this.data.minBank){
       this.data.isAble = true;
       this.dimed.visible = false;
       this.iconRock.visible = false;
       this.btn.visible = true;
    }else{
       this.data.isAble = false;
       this.dimed.visible = true;
       this.iconRock.visible = true;
       this.btn.visible = false;
    }
  }

}
