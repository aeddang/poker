import Component from 'Skeleton/component';
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
    this.playerNum = 8;
  }
  reset() {}
}

export default class PlayerViewer extends Component {
  constructor() {
    super();
    this.info = new PlayerViewerInfo();
    this.players = [];
  }

  remove() {
    super.remove();
    this.players.forEach( p => { p.remove(); });
    this.players = null;
  }

  getElementProvider() { return new PlayerViewerBody(this.body); }
  onCreate(elementProvider) {
    for(var i=0; i<this.info.playerNum; ++i) {
      let player = new Player();
      player.init( this.getBody() );
      let body = player.getBody();
      this.players.push(player);
    }
  }

  onResize() {
    let bounce = Util.convertRectFromDimension(this.getBody());
    let margin = 100;
    let posX = bounce.width/2;
    let posY = bounce.height/2;
    let radiusX = posX - margin;
    let radiusY = posY - margin;
    let len = this.info.playerNum + 1;
    var rotate = 0;
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

  onUpdateStatus(status){

  }
}
