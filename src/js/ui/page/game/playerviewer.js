import SyncPropsComponent from 'Component/syncpropscomponent';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import Player from './player';
import Position from './position';

class PlayerViewerBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
    `;
  }
}

class PlayerViewerInfo {
  constructor() {
    this.myPosition = 0;
    this.reset();
  }
  reset() {}
}

export default class PlayerViewer extends SyncPropsComponent {
  constructor() {
    super();
    this.debuger.tag = 'PlayerViewer';
    this.info = new PlayerViewerInfo();
    this.players = {};
    this.positions = [];
  }

  remove() {
    super.remove();
    for (let id in this.players) this.players[id].remove();
    this.positions.forEach( p => { p.remove(); });
    this.players = null;
    this.positions = null;
  }

  getElementProvider() { return new PlayerViewerBody(this.body); }
  onCreate(elementProvider) {
  }

  setupWatchs(){
    this.watchs = {
      maxPlayer: value =>{
        this.onCreatePositions(value);
      }
    };
  }

  setupSyncProps(){
    let syncProps = { maxPlayer:0 };
    super.setupSyncProps(syncProps);
  }

  onCreatePositions( playerNum ){
    for(var i=0; i < playerNum; ++i) {
      let position = new Position();
      position.init( this.getBody() , i).subscribe ( this.onUiEvent.bind(this) );
      this.positions.push(position);
    }
    this.onResize();
  }

  onUiEvent(event) {
    this.delegate.next(event);
  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let marginX = 0;
    let marginY = -100;
    let width = 150;
    let height = 80;
    let centerX = bounce.width/2;
    let centerY = bounce.height/2;
    let posX = centerX - (width/2);
    let posY = centerY - (height/2) + marginY;
    let radiusX = centerX - width - Math.abs(marginX);
    let radiusY = centerY - height - Math.abs(marginY);
    var posLen = this.positions.length;
    var len = posLen  + 1 ;
    var rotate = 90;
    var sumRotate = 360 / len;
    let start = this.info.myPosition;
    let end = len + start;
    let dealler = Math.ceil( posLen / 2 ) + this.info.myPosition;
    var pos = this.info.myPosition;
    for(var i = start; i < end; ++ i){
      if( i != dealler) {
        let posIdx  = pos % posLen;
        let position = this.positions[ posIdx ];
        let r = rotate * Math.PI/180
        position.x = posX + (Math.cos(r) *radiusX);
        position.y = posY + (Math.sin(r) *radiusY);
        pos++;
      }
      rotate += sumRotate
    }
  }

  onJoin(id, syncProps, itsMe) {
    this.onCreatePlayer( id, syncProps, itsMe );
  }

  onCreatePlayer( id, syncProps, itsMe ){
    let player = new Player();
    player.init( this.getBody(), itsMe ).subscribe ( this.onUiEvent.bind(this) );
    player.onUpdateSyncProps( syncProps );
    this.players[id] = player;
  }

  onLeave(id) {
    let player = this.players[id];
    if( player == null ) return;
    player.remove();
    delete this.players[id]
    let position = this.positions[ player.position ];
    if( position != null) position.leavePlayer();
  }

  onUpdatePlayer(id, prop, value){
    let player = this.players[id];
    if( player == null ) return;

    if( prop == 'position') {
      let position = this.positions[ value ];
      if( position == null ) return;
      position.getBody().appendChild( player.getBody() );
      if( player.me ) this.onSelectedMyposition( value );
      else position.joinPlayer();
    }
    player.onUpdateSyncProp( prop, value);
  }

  onSelectedMyposition( position ){
    this.positions.forEach( p => { p.joinPlayer(); } );
    this.info.myPosition = position;
    this.onResize();
  }

  onShowCard( id, idx, cardData ) {
    this.players[id].showCard( idx, cardData );
  }

  onHideCard( id, idx) {
    this.players[id].hideCard( idx );
  }
}
