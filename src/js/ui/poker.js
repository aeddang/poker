import * as Colyseus from "colyseus.js";
import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Config from "Util/config";
import * as Login from "ViewModel/login";
import Header from 'Component/header';
import Join from 'Page/join';
import Home from 'Page/home';

class PokerBody extends ElementProvider {
  writeHTML() {
    this.body.classList.add("poker");
    this.body.innerHTML =`
    <div id='${this.id}header' class ='header'></div>
    <div id='${this.id}pageArea' class ='page-area'></div>
    `;
  }
}

class PokerInfo {
  constructor() {
    this.reset();
    this.isFullScreen = false;
    this.finalSize = {width:0, height:0};
  }

  reset() {

  }
}

export default class Poker extends Component {
  constructor() {
    super();
    this.info = new PokerInfo();
    this.client = new Colyseus.Client(Config.SERVER_HOST);
    this.header = new Header();
    Login.model.delegate.subscribe ( this.onLoginEvent.bind(this) );
  }
  remove() {
    super.remove();
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
    this.pageArea = elementProvider.getElement('pageArea');
    this.header.init(elementProvider.getElement('header'));
    this.onResize();
    this.onPageChange(Config.Page.Home);
  }

  setupEvent() {
    this.attachEvent(window, "resize", this.onResize.bind(this));
  }

  onPageChange(id, options=null) {
    if(this.currentPage != null) this.currentPage.remove();
    let page = null;
    switch( id ) {
      case Config.Page.Home : page = new Home(); break;
      case Config.Page.Join : page = new Join(); break;
      case Config.Page.Game : page = new Game(); break;
    }
    this.currentPage = page;
    page.init(this.pageArea, this.client, options).subscribe ( this.onPageEvent.bind(this) );
  }

  onPageEvent (event) {


  }

  onLoginEvent(event) {
    switch(event.type) {
      case Login.EVENT.ON_PROFILE : this.onPageChange(Config.Page.Join); break;
      case Login.EVENT.LOGOUT : this.onPageChange(Config.Page.Home); break;
    }
  }

  checkFullscreen() {
    var isFullScreen = ((typeof document.webkitIsFullScreen) !== 'undefined') ? document.webkitIsFullScreen : document.mozFullScreen;
    if(this.info.isFullScreen == isFullScreen) return;
    this.info.isFullScreen = isFullScreen;
    (isFullScreen == true) ? this.onFullScreenEnter() : this.onFullScreenExit();
  }

  enterFullscreen() {
    if (this.body.requestFullscreen) this.body.requestFullscreen();
    if (this.body.mozRequestFullScreen) this.body.mozRequestFullScreen();
    if (this.body.webkitRequestFullscreen) this.body.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  }

  exitFullscreen() {
    if (document.cancelFullScreen) document.cancelFullScreen();
    if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
  }

  onResize(data) {
    let bounce = Util.convertRectFromDimension(this.body);
    if( bounce.width != this.info.finalSize.width || bounce.height != this.info.finalSize.height ) {
        this.checkFullscreen();
        let headerBounce = Util.convertRectFromDimension(this.header.getBody());
        this.pageArea.style.height = Util.getStyleUnit(bounce.height - headerBounce.height);
        if(this.currentPage != null) this.currentPage.onResize();
    }
  }

  onFullScreenEnter(data) {
    this.info.isFullScreen = true;
  }

  onFullScreenExit(data) {
    this.info.isFullScreen = false;
  }
}
