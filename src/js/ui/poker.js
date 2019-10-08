import * as Colyseus from "colyseus.js";
import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Config from "Util/config";
import * as Account from "ViewModel/account";
import * as Page from 'Page/page';
import * as Popup from 'Page/popup/popup';
import * as SoundFactory from 'Util/soundfactory';
import * as MessageBoxController from 'Component/messagebox';
import { ErrorAlert, UiAlert } from  "Util/message";

class PokerBody extends ElementProvider {
  writeHTML() {
    this.body.classList.add("poker");
    this.body.innerHTML =`
    <div id='${this.id}soundArea' class ='sound-area'></div>
    <div id='${this.id}pageArea' class ='page-area'></div>
    <div id='${this.id}popupArea' class ='popup-area'></div>
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

class Poker extends Component {
  constructor() {
    super();
    this.debuger.tag = 'Poker';
    this.info = new PokerInfo();
    this.client = null;
    this.popups = [];
  }

  init(body){
    super.init(body);
    MessageBoxController.instence.setupBody(body);
    this.onPageChange(Config.Page.Home);
    return this.delegate;
  }

  remove() {
    super.remove();
    this.removeClient();
    this.info = null;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //PUBLIC start
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  pageChange(id, options=null) {
    let hash = window.location.hash.replace("#","");
    this.debuger.log(id, "pageChange " + hash);
    if(hash == id) return this.onPageChange(id, options);
    location.hash = id;
  }

  openPopup(id, options=null){
    let stateObj = {popupId : id, options:options};
    window.history.pushState(stateObj, id, "popup.html");
    return this.onOpenPopup(stateObj);
  }

  closePopup(id){
    let find = this.popups.find( pop=> pop.popupId === id );
    if(find == null) return;
    window.history.back();
  }

  createClient(port){
    this.removeClient();
    this.client = new Colyseus.Client(Config.SERVER_HOST.replace("%path%", port));
    this.client.onError.add((err) => {
      switch(this.info.currentPageId){
        case Config.Page.Play :
          MessageBoxController.instence.alert("",ErrorAlert.DisableGame);
          this.pageChange(Config.Page.Home);
          break;
        default : this.info.isGameReady = false ; break;
      }
    });

    this.client.onOpen.add(() => {
      this.info.isGameReady = true;
      this.pageChange(Config.Page.Play);
    });
  }

  removeClient(){
    if(this.client == null) return;
    this.client.close();
    this.client= null;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //PUBLIC end
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getElementProvider() { return new PokerBody(this.body); }
  onCreate(elementProvider) {
    SoundFactory.getInstence( elementProvider.getElement('soundArea') );
    this.pageArea = elementProvider.getElement('pageArea');
    this.popupArea = elementProvider.getElement('popupArea');
    this.onResize();
    Account.loginModel.init();
    this.popupArea.visible = false;
  }

  setupEvent() {
    Account.loginModel.delegate.subscribe ( this.onLoginEvent.bind(this) );
    this.attachEvent(window, "resize", this.onResize.bind(this));
    this.attachEvent(window, "orientationchange", e =>{
      if(screen.orientation.type.indexOf("portrait") != -1) MessageBoxController.instence.alert("",UiAlert.DisableoOrientation);
    });
    this.attachEvent(window, "hashchange", e =>{
        let hash = window.location.hash;
        this.onPageChange(hash.replace("#",""));
    });

    this.attachEvent(window, "popstate", e =>{
        this.debuger.log(JSON.stringify(e.state), "onPopstate");
        if(e.state == null){
          this.onCloseAllPopup();
        }else{
          let find = this.popups.findIndex( pop=> pop.popupId === e.state.popupId );
          if( find == -1) this.onOpenPopup(e.state);
          else this.onClosePopup(e.state.popupId, find);
        }
    });
  }

  onOpenPopup(stateObj){
    this.debuger.log(this.popups, "onOpenPopup");
    let page = null;
    switch( stateObj.popupId ) {
      case Config.Popup.Join : page = new Popup.Join(); break;
      default : break;
    }
    if(page == null) return;
    this.popups.push(stateObj);
    stateObj.page = page;
    this.popupArea.visible = true;
    return page.init(this.popupArea, stateObj.options);
  }

  onClosePopup(id, idx){
    let page = this.popups[idx].page;
    this.popups.splice( idx , 1);
    this.popupArea.visible = false;
    this.debuger.log(this.popups, "onClosePopup");
    if(page == null) return;
    page.remove();
  }

  onCloseAllPopup(){
    this.popups.forEach( popup => {if(popup.page!=null) popup.page.remove();} );
    this.popups = [];
    this.popupArea.visible = false;
    this.debuger.log(this.popups, "onCloseAllPopup");
  }

  onPageChange(id, options=null) {
    this.debuger.log(id, "onPageChange");
    if(this.info.isGameReady == false && id == Config.Page.Play){
      MessageBoxController.instence.alert("",ErrorAlert.DisableConnect);
      return;
    }
    this.onCloseAllPopup();
    if(Config.Page.Play != id) this.removeClient();
    if(this.currentPage != null) this.currentPage.remove();
    let page = null;
    switch( id ) {
      case Config.Page.Home : page = new Page.Home(); break;
      case Config.Page.Play : page = new Page.Play(); break;
      default : page = new Page.Home(); break;
    }
    if(page == null) return;
    this.info.currentPageId = id;
    this.currentPage = page;
    page.init(this.pageArea, this.client, options).subscribe ( this.onPageEvent.bind(this) );
  }

  onPageEvent (event) {

  }

  onLoginEvent(event) {
    switch(event.type) {
      case Account.EVENT.LOGOUT : this.pageChange(Config.Page.Home); break;
    }
  }

  onResize(data) {
    let bounce = Util.convertRectFromDimension(this.body);
    if( bounce.width != this.info.finalSize.width || bounce.height != this.info.finalSize.height ) {
        this.pageArea.height = bounce.height;
        if(this.currentPage != null) this.currentPage.onResize();
        this.popups.forEach( popup => { if(popup.page!=null) popup.page.onResize() } );
    }
    this.info.finalSize = bounce;
  }

}
const instence = new Poker();
class PokerModule {
  constructor() {}

  init(body){
    return instence.init(body);
  }

  pageChange(id, options=null) {
    instence.pageChange(id, options);
  }

  createClient(port){
    instence.createClient(port);
  }

  openPopup(id, options=null){
    return instence.openPopup(id, options)
  }

  closePopup(id){
    instence.closePopup(id)
  }
}

export const pokerModule = new PokerModule();
