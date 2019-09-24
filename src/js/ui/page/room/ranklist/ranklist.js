import * as Colyseus from "colyseus.js";
import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Config from "Util/config";
import * as Account from "ViewModel/account";
import * as Page from 'Page/page';
import * as Api from 'Api/apicontroller';

class RankListBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("rank-list");
    this.body.appendChild(cell);
  }
}

class ListItemBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("item");
    cell.innerHTML = `
      <div id='${this.id}rank' class='rank' ></div>
      <div class='profile'>
        <img id='${this.id}profileImg' class='profile-img'></img>
        <div class='profile-cover'></div>
      </div>
      <div class='info'>
        <div id='${this.id}text' class='text' ></div>
        <div id='${this.id}desc' class='desc' ></div>
      </div>
      <button id='${this.id}btn' class='btn'></button>
    `;
    this.body.appendChild(cell);
  }
}

class ListData {
  constructor() {
  }

  setData(data,idx) {
    this.bank = data.bank;
    this.name = data.name;
    this.rank = idx+1;
    this.profileImg = data.profileImg;
  }
}

export default class RankList extends Component {
  constructor() {
    super();
  }

  remove() {
    super.remove();
  }

  getElementProvider() { return new RankListBody(this.body); }
  onCreate(elementProvider) {
    Api.getRanks("0").subscribe(
	    response => this.onCreateListItem(response.data.data),
	    error => this.onError( error.response.data )
	  );
  }

  onCreateListItem(datas){
    datas.forEach( (data,idx) => {
      let item = new ListItem();
      item.data = new ListData();
      item.data.setData(data, idx);
      item.init( this.getBody() ).subscribe ( e => { this.delegate.next(e) } );
    });
  }

  onError(data){
  }

  setupEvent() {

  }

  onResize(data) {

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
    this.desc = null;
    this.rank = null;
    this.profileImg = null;
    this.btn = null;
  }

  getElementProvider() { return new ListItemBody(this.body); }
  onCreate(elementProvider) {
    this.rank = elementProvider.getElement('rank');
    this.desc = elementProvider.getElement('desc');
    this.text = elementProvider.getElement('text');
    this.profileImg = elementProvider.getElement('profileImg');
    this.btn = elementProvider.getElement('btn');
    this.rank.innerHTML = this.data.rank + "st";
    this.text.innerHTML = this.data.name;
    this.desc.innerHTML = "$"+Util.numberWithCommas(this.data.bank);
    this.profileImg.src = this.data.profileImg;
    this.getBody().classList.add("rank" + this.data.rank);
  }

  setupEvent() {
    this.attachEvent(this.btn, "click", e => {} );
  }

}
