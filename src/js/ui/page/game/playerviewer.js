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
    let syncProps = {
      maxPlayer:0,
    };
    super.setupSyncProps(syncProps);
  }

  onCreatePositions( playerNum ){
    for(var i=0; i < playerNum; ++i) {
      let position = new Position();
      position.init( this.getBody() , i).subscribe ( this.onUiEvent.bind(this) );
      this.positions.push(position);
    }
    this.onResize();
    this.debuger.log(playerNum , 'onCreatePositions');
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
    let len = this.positions.length + 1;
    var rotate = -90;
    var sumRotate = 360 / len;
    this.positions.forEach( p => {
      rotate += sumRotate
      let r = rotate * Math.PI/180
      let x = posX + (Math.cos(r) *radiusX);
      let y = posY + (Math.sin(r) *radiusY);
      let pbd = p.getBody();
      pbd.style.left = Util.getStyleUnit( x );
      pbd.style.top = Util.getStyleUnit( y );
    });
  }

  onJoin(id, syncProps, itsMe) {
    this.debuger.log(syncProps , 'onJoin');
    this.onCreatePlayer( id, syncProps, itsMe );
  }

  onCreatePlayer( id, syncProps, itsMe ){
    let player = new Player();
    this.debuger.log( player , 'onCreatePlayer');
    player.init( this.getBody(), itsMe ).subscribe ( this.onUiEvent.bind(this) );
    player.onUpdateSyncProps( syncProps );
    this.players[id] = player;
    this.debuger.log(id , 'onCreatePlayer');
  }

  onLeave(id) {
    let player = this.players[id];
    if( player == null ) return;
    this.positions[ player.position ].leavePlayer();
    player.remove();
    delete this.players[id]
  }

  onUpdatePlayer(id, prop, value){
    let player = this.players[id];
    this.debuger.log( player , 'onUpdatePlayer');
    if( player == null ) return;

    if( prop == 'position') {
      let position = this.positions[ value ];
      if( position == null ) return;
      position.getBody().appendChild( player.getBody() );
      if( player.me ) this.positions.forEach( p => { p.joinPlayer(); } );
      else position.joinPlayer();
    }
    player.onUpdateSyncProp( prop, value);
  }
}
