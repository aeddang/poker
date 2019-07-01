import * as Colyseus from "colyseus.js";
import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Config from "Util/config";
import * as Account from "ViewModel/account";
import * as Page from 'Page/page';
import * as SoundFactory from './soundfactory';
import { ErrorAlert } from  "Util/message";

class PokerBody extends ElementProvider {
  writeHTML() {
    this.body.classList.add("poker");
    this.body.innerHTML =`
    <div id='${this.id}soundArea' class ='sound-area'></div>
    <div id='${this.id}pageArea' class ='page-area'></div>
    `;
  }
}

class PokerInfo {
  constructor() {
    this.reset();
    this.currentPageId = "";
    this.isGameReady = false;
    this.finalSize = {width:0, height:0};
  }

  reset() {

  }
}

export default class Poker extends Component {
  constructor() {
    super();
    this.info = new PokerInfo();
    this.client = null;
  }
  remove() {
    super.remove();
    this.removeClient();
    this.info = null;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //PUBLIC start
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  pageChange(id,options=null) {
    this.onPageChange(id, options);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //PUBLIC end
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getElementProvider() { return new PokerBody(this.body); }
  onCreate(elementProvider) {
    SoundFactory.getInstence( elementProvider.getElement('soundArea') );
    this.pageArea = elementProvider.getElement('pageArea');
    this.onResize();
    this.onPageChange(Config.Page.Home);
  }

  createClient(port){
    this.removeClient();
    this.client = new Colyseus.Client(Config.SERVER_HOST + ":" + port);
    this.client.onError.add((err) => {
      switch(this.info.currentPageId){
        case Config.Page.Play :
          alert(ErrorAlert.DisableGame);
          this.onPageChange(Config.Page.Home);
          break;
        default : this.info.isGameReady = false ; break;
      }
    });

    this.client.onOpen.add(() => {
      this.info.isGameReady = true;
      this.onPageChange(Config.Page.Play);
    });
  }

  removeClient(){
    if(this.client == null) return;
    this.client.close();
    this.client= null;
  }

  setupEvent() {
    Account.loginModel.delegate.subscribe ( this.onLoginEvent.bind(this) );
    this.attachEvent(window, "resize", this.onResize.bind(this));
  }

  onPageChange(id, options=null) {
    if(this.info.isGameReady == false && id == Config.Page.Play){
        alert(ErrorAlert.DisableConnect);
        return;
    }
    if(Config.Page.Play != id) this.removeClient();

    if(this.currentPage != null) this.currentPage.remove();
    let page = null;
    switch( id ) {
      case Config.Page.Home : page = new Page.Home(); break;
      case Config.Page.Join : page = new Page.Join(); break;
      case Config.Page.Play : page = new Page.Play(); break;
    }
    this.info.currentPageId = id;
    this.currentPage = page;
    page.init(this.pageArea, this.client, options).subscribe ( this.onPageEvent.bind(this) );
  }

  onPageEvent (event) {

  }

  onLoginEvent(event) {
    switch(event.type) {
      case Account.EVENT.LOGOUT : this.onPageChange(Config.Page.Home); break;
    }
  }

  onResize(data) {
    let bounce = Util.convertRectFromDimension(this.body);
    if( bounce.width != this.info.finalSize.width || bounce.height != this.info.finalSize.height ) {
        this.pageArea.height = bounce.height;
        if(this.currentPage != null) this.currentPage.onResize();
    }
    this.info.finalSize = bounce;
  }

}
