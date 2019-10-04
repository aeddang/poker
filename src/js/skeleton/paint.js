import { Subject} from 'rxjs';
import { convertRectFromDimension } from './util';
import { AnimateEvent, ANIMATE_EVENT } from './event';
import Debugger from './log';
const debuger = new Debugger(this);
debuger.tag = 'Paint'

export default class Paint {
  constructor(delegate = new Subject()) {
    this.delegate = delegate;
    this.body = null;
    this.opacity = 0;
    this.stream = null;
    this.canvas = null;
    this.context = null;
    this.frm = 0;
    this.totalFrame = -1;
    this.isAutoView = false;
    this.isDrawing = false;
    this.dpr = 1;
  }

  init(body, isAutoView = false) {
    this.body = body;
    this.isAutoView = isAutoView;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas = document.createElement("canvas");
    this.body.appendChild(this.canvas);
    var bounce =  convertRectFromDimension(this.body);
    this.canvas.width = bounce.width * this.dpr;
    this.canvas.height = bounce.height * this.dpr;
    this.canvas.style.width = bounce.width+"px";
    this.canvas.style.height = bounce.height+"px";

    return this.delegate;
  }

  remove() {
    this.stop();
    this.delegate = null;
    this.body = null;
    this.stream = null;
    this.canvas = null;
    this.context = null;
  }

  rePlay() {
    this.stop();
    this.frm = 0;
    this.play();
  }

  play() {
    if(this.isAutoView) this.body.style.display = 'block';
    if(this.stream != null) window.cancelAnimationFrame(this.stream);
    this.isDrawing = true;
    this.stream = window.requestAnimationFrame(this.onDraw.bind(this));
  }

  stop() {
    if(this.isAutoView) this.body.style.display = 'none';
    this.isDrawing = false;
    if(this.stream != null) window.cancelAnimationFrame(this.stream);
    this.stream = null;
  }

  clear(){
    if(this.context == null) return;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  onDraw() {
    if(this.context == null) {
      this.context = this.canvas.getContext('2d');
      this.context.scale(this.dpr, this.dpr);
      this.doInitDraw();
    }
    if(this.frm == 1 ) this.delegate.next(new AnimateEvent(ANIMATE_EVENT.START));
    this.doDraw();
    this.frm ++;
    if(this.frm == 1 ) this.delegate.next(new AnimateEvent(ANIMATE_EVENT.PROGRESS, this.frm));
    if((this.totalFrame != -1) && ( this.frm >= this.totalFrame)){
      this.frm = 0;
      this.stop();
      if(this.frm == 1 ) this.delegate.next(new AnimateEvent(ANIMATE_EVENT.COMPLETE));
    }
    if(this.isDrawing == true) this.stream = window.requestAnimationFrame(this.onDraw.bind(this));
  }

  doInitDraw(){}
  doDraw(){}
}

export class TextureFactory {
  constructor() {
    this.textures = {};
  }
  remove() {
    for (let id in this.textures) this.textures[id].src = '';
    this.textures = null;
  }

  getTexture( id ) {
    var texture = this.textures[ id ];
    if( texture == null ) {
      texture = new Image();
      this.textures[ id ] = texture;
    }
    return texture;
  }
}
const ShareTextureFactory = new TextureFactory();


export class FrameAnimation extends Paint {
  init(body, path, low, column, totalFrame = -1, isAutoView = false) {
    super.init(body, isAutoView);
    this.totalFrame = (totalFrame == -1) ? low * column : totalFrame;
    this.low = low;
    this.column = column;
    this.width = 0;
    this.height = 0;
    this.img = ShareTextureFactory.getTexture( path );
    this.handler = e => { this.initSet(); }
    this.img.addEventListener('load', this.handler);
    if( this.img.src == '' ) this.img.src = path;
    else this.initSet();
  }

  initSet(){
    if( this.img.width == 0 ) return;
    this.width = this.img.width / this.column;
    this.height = this.img.height / this.low;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.img.removeEventListener('load', this.handler);
  }

  remove() {
    this.img = null;
    super.remove();
  }

  set frame( f ){
    this.frm = f;
    this.onDraw();
  }

  get frame(){
    return this.frm;
  }

  doDraw() {
    let idxX = this.frm % this.column;
    let idxY = Math.floor( this.frm / this.column );
    let tx = idxX*this.width;
    let ty = idxY*this.height;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage( this.img, tx , ty , this.width*this.dpr, this.height*this.dpr, 0, 0, this.width , this.height);
  }
}

export class LoadingSpiner extends Paint {
  init(body, width = 80, height = 80, depth = 10, isAutoView = true) {
    super.init(body, isAutoView);
    this.width = width;
    this.height = height;
    this.depth = depth;
    let margin = this.depth/2;
    let frame = 30;
    let div = 2;
    let radiusX = this.width/2 - margin;
    let radiusY = this.height/2 - margin;
    let start = 45;
    let diff = 360 / frame;
    this.points = new Array();
    for (var i=0; i<= (frame * div); ++i){
      var r = (i%frame)*diff;
      r = r*Math.PI/180;
      var x = radiusX + margin + (Math.cos(r) * radiusX);
      var y = radiusY + margin + (Math.sin(r) * radiusY);
      var point = {x:x,y:y};
      this.points.push(point);
    }
  }

  doInitDraw() {
    this.context.lineCap = 'round';
    this.context.lineWidth = this.depth;
  }

  doDraw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    let frame = this.points.length;
    let len = 26;
    for (var i=0; i < len; ++i) {
      var a = Math.sin((len-i)/len);
      var gradient=this.context.createLinearGradient(0,0,this.width,this.height);
      gradient.addColorStop(0,'rgba(96,68,45,'+a+')');
      gradient.addColorStop(0.3,'rgba(245,221,177,'+a+')');
      gradient.addColorStop(1,'rgba(174,130,89,'+a+')');
      this.context.strokeStyle = gradient;
      var idx  = ((this.frm + i) % frame);
      var point = this.points[ idx ];
      (i==0) ? this.context.moveTo(point.x, point.y) : this.context.lineTo(point.x, point.y);
      this.context.stroke();
    }
    this.context.closePath();
    //this.context.save();
  }
}
