import SyncPropsComponent from 'Component/syncpropscomponent';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import Player from './Player';

class PlayerViewerBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
    `;
  }
}

class PlayerViewerInfo {
  constructor() {
    this.reset();
    this.playerNum = 9;
  }
  reset() {}
}

export default class PlayerViewer extends SyncPropsComponent {
  constructor() {
    super();
    this.debuger.tag = 'PlayerViewer';
    this.info = new PlayerViewerInfo();
    this.players = [];
    this.positions = {};
  }

  remove() {
    super.remove();
    this.players.forEach( p => { p.remove(); });
    this.players = null;
    this.positions = null;
  }

  getElementProvider() { return new PlayerViewerBody(this.body); }
  onCreate(elementProvider) {
    for(var i=0; i<this.info.playerNum; ++i) {
      let player = new Player();
      player.init( this.getBody() , i);
      let body = player.getBody();
      this.players.push(player);
    }
  }

  setupSyncProps(){
    this.syncProps = {
      maxPlayer:1,
      time:0,
      currentID:''
    };

    this.watchs = {
      maxPlayer: value =>{
        this.debuger.log(value, 'maxPlayerA');
      },
      time: value =>{
        this.debuger.log(value, 'timeA');
      },
      currentID: value =>{
        this.debuger.log(value, 'currentIDA');
      }
    };
    super.setupSyncProps();
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
    let len = this.info.playerNum + 1;
    var rotate = -90;
    var sumRotate = 360 / len;
    this.players.forEach( p => {
      rotate += sumRotate
      let r = rotate * Math.PI/180
      let x = posX + (Math.cos(r) *radiusX);
      let y = posY + (Math.sin(r) *radiusY);
      let pbd = p.getBody();
      pbd.style.left = Util.getStyleUnit( x );
      pbd.style.top = Util.getStyleUnit( y );
    });
  }

  onJoin(id, syncProps) {
    let pos = syncProps.position;
    let player = this.players[ pos ];
    if( player == undefined ) {
      this.debuger.warn(id, 'join player position undefined');
      return;
    }
    this.positions[id] = player;
    player.onJoin( syncProps );
  }

  getPlayer(id) {
    let player = this.positions[ id ];
    if( player == undefined ) {
      this.debuger.warn(id, 'player undefined');
      return null;
    }
    return player;
  }

  onLeave(id) {
    let player = this.getPlayer( id );
    if( player == null ) return;
    player.onLeave();
    delete this.positions[id];
  }

  onUpdatePlayer(id, prop, value){
    let player = this.getPlayer( id );
    if( player == null ) return;
    player.onUpdateSyncProp( prop, value);
  }
}
