import { Subject } from 'rxjs';
import { Rect, Point, convertRectFromDimension, convertPointFromDimension } from './util';
import { MoveEvent, MOVE_EVENT } from './event';
import { log } from './log';


export function decoratorDynamicDom(element, id) {
  if( element == null ) {
    //log( "decoratorDynamicDom" , 'warn', id , "element undefined");
    return null;
  }
  overoadProperty(element, 'x', 'left', 'px');
  overoadProperty(element, 'y', 'top', 'px');
  overoadProperty(element, 'width', 'width', 'px');
  overoadProperty(element, 'height', 'height', 'px');
  function overoadProperty( ele, prop, attribute, unit = '' ){
    if( element[ prop ] != undefined ) return //log( 'decoratorDynamicDom' , 'warn', prop , 'prop exist');
    Object.defineProperty(ele, prop, {
      get: function(){ return this['_' + prop] || 0; },
      set: function( value ){
        this['_' + prop] = value;
        this.style[ attribute ] = value + unit;
      }
    })
  }
  if( element.visible == undefined ) {
    let display = ( element.style.display == 'none' ) ? element.style.display : 'block';

    Object.defineProperty(element, 'visible', {
      get: function(){ return this._visible || true; },
      set: function(visible) {
        this._visible = visible;
        visible ? this.style.display = display : this.style.display = 'none';
      }
    });
  }
  return element;
}

export class DragElement extends Component {
  constructor(delegate = new Subject()) {
    super(delegate);
    this.parent = null;
	  this.orginRange = null;
	  this.delegate = delegate;
    this.startPos = new Point();
	  this.movePos = new Point();
	  this.changePos = new Point();
	  this.movePos = new Point();
    this.maxPos = new Point();
    this.valueX = 0;
    this.valueY = 0;
	  this.viewW = 0;
	  this.viewH = 0;
    this.isDrag = false;
  }

  init(body,range = null) {
    this.parent = body.parentNode;
    this.orginRange = range;
    var viewBounce = convertRectFromDimension(body);
    this.viewW = Math.ceil(viewBounce.width);
	  this.viewH = Math.ceil(viewBounce.height);
    return super.init(body);
  }

  remove() {
    super.remove();
    this.parent = null;
    this.orginRange = null;
    this.delegate = null;
    this.startPos = null;
    this.movePos = null;
    this.changePos = null;
    this.movePos = null;
    this.maxPos = null;
  }

  setRange() {
		this.range = (this.orginRange == null) ? convertRectFromDimension(this.parent) : this.orginRange;
    this.maxPos.x=this.range.width;
		this.maxPos.y=this.range.height;
	}

  setupEvent() {
    this.attachEvent(this.body, "mousedown", this.dragStart.bind(this) );
    this.attachEvent(window, "mousemove", this.dragMove.bind(this) );
    this.attachEvent(window, "mouseup", this.dragEnd.bind(this) );
    this.attachEvent(window, "mouseleave", this.dragEnd.bind(this) );
  }

  getPoint(e) {
    var posX = e.clientX - this.range.x;
    var posY = e.clientY - this.range.y;
    var maxX=this.maxPos.x;
    var maxY=this.maxPos.y;
    var minX=0;
    var minY=0;
    if(posX>maxX) posX=maxX;
    if(posX<minX) posX=minX;
    if(posY>maxY) posY=maxY;
    if(posY<minY) posY=minY;
    return new Point(posX,posY);
  }

  dragStart(e) {
		if(this.isDrag) return;
		this.setRange();
		this.isDrag=true;
	  this.startPos=null;
	  this.movePos=new Point();
		this.changePos=new Point();
	}

	dragMove(e) {
	  if(!this.isDrag) return;
		if(this.startPos==null) {
      this.startPos=this.getPoint(e);
      this.delegate.next(new MoveEvent(MOVE_EVENT.START, this));
    }
		this.movePos=this.getPoint(e);
    this.changePos=new Point(this.movePos.x-this.startPos.x,this.movePos.y-this.startPos.y);
    this.valueX=this.movePos.x/this.maxPos.x;
    this.valueY=this.movePos.y/this.maxPos.y;
    this.delegate.next(new MoveEvent(MOVE_EVENT.MOVE, this));
	}

	dragEnd(e) {
		if(!this.isDrag) return;
		this.isDrag=false;
    this.delegate.next(new MoveEvent(MOVE_EVENT.END, this));
	}
}



export class MoveElement extends Component {
  constructor(delegate = new Subject()) {
    super(delegate);
    this.startPoint = null;
  }

  remove() {
    super.remove();
    this.startPoint = null;
  }

  setupEvent() {
    this.attachEvent(this.body, "mouseover", this.moveStart.bind(this) );
    this.attachEvent(this.body, "mousemove", this.move.bind(this) );
    this.attachEvent(this.body, "mouseout", this.moveEnd.bind(this) );
  }

  getPoint(e) {
    var posX = e.clientX - this.startPoint.x;
    var posY = e.clientY - this.startPoint.y;
    return new Point(posX,posY);
  }

  moveStart(e) {
    this.startPoint = convertRectFromDimension(this.body);
    this.delegate.next(new MoveEvent(MOVE_EVENT.START, this.getPoint(e)));
	}

	move(e) {
	  this.delegate.next(new MoveEvent(MOVE_EVENT.MOVE, this.getPoint(e)));
	}

	moveEnd(e) {
    this.delegate.next(new MoveEvent(MOVE_EVENT.END, this.getPoint(e)));
	}
}
