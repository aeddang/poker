import { Subject, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import Debugger from './log';
import ElementProvider from './elementprovider';

export default class Component {
  constructor(delegate = new Subject()) {
    this.debuger = new Debugger();
    this.delegate = delegate;
    this.body = null;
    this.cell = null;
    this.isDown = false;
    this.attachEvents = [];
    this.disposable = [];
    this.debuger.log("constructor", '', 0);
  }

  init(body) {
    if( typeof(body) == 'string' ) body = document.getElementById(body);
    this.body = body;
    this.createElements();
    this.setupEvent();
    this.setupSubscription();
    this.debuger.log("init", '', 0);
    return this.delegate;
  }

  getBody() {
    return (this.cell) ? this.cell : this.body;
  }

  remove() {
    if(this.delegate == null) return;
    this.delegate.complete(this);
    this.disposable.forEach( s=> s.unsubscribe() );
    this.clearEvent();
    if(this.cell == null) this.body.innerHTML = "";
    else if(this.cell.parentNode) this.cell.parentNode.removeChild(this.cell);
    this.disposable = null;
    this.delegate = null;
    this.cell = null;
    this.body = null;
    this.debuger.log("remove", '', 0);
    this.debuger = null;
  }

  getElementProvider() { return null; }
  createElements() {
    let elementProvider = this.getElementProvider();
    if(elementProvider == null) return;
    elementProvider.init();
    elementProvider.writeHTML();
    this.cell = elementProvider.getElement('cell');
    this.onCreate(elementProvider);
  }
  onCreate(elementProvider){}

  setupSubscription (){}
  setupEvent(){}
  setupDelegate(){}

  attachEvent(element, event, handler, useCapture = false) {
    let evt = new AttachEvent(element,event,handler);
    this.attachEvents.push(evt);
    element.addEventListener(event, handler, useCapture);
  }

  detachEvent(elements, handler = null) {
    this.attachEvents = this.attachEvents.filter( evt => {
      let find = elements.indexOf(evt.element);
      if(find == -1) return true;
      elements.splice(find,1);
      evt.element.removeEventListener(evt.event,evt.handler);
      if( handler ) handler( evt.element );
      return false;
    });
  }

  clearEvent() {
    if(this.attachEvents == null) return;
    this.attachEvents.forEach( evt => evt.element.removeEventListener(evt.event,evt.handler) );
    this.attachEvents = null;
  }

  onResize(){}

  onComponentEvent(event){}
}


export class AnimationComponent extends Component {
  constructor(body,delegate) {
    super(body,delegate);
  }

  init(body, delay = 50) {
    super.init(body);
    this.doReadyAni();
    this.rxInitAni = interval(WAIT_TIME).pipe(take(1)).subscribe (
        this.doInitAni.bind(this)
    );
    return this.delegate;
  }

  doReadyAni() {
    let animationBody = (this.cell) ? this.cell : this.body;
    animationBody.style.opacity = 0;
    animationBody.classList.add( "animate-in" );
  }

  doInitAni() {
    let animationBody = (this.cell) ? this.cell : this.body;
    animationBody.style.opacity = 1;
  }

  removeAni() {
    if(this.delegate == null) return;
    let animationBody = (this.cell) ? this.cell : this.body;
    animationBody.style.opacity = 0;

    this.rxRemover = timer(300).subscribe (
      this.remove.bind(this)
    );
  }

  remove() {
    super.remove();
    if(this.rxInitAni) this.rxInitAni.unsubscribe();
    if(this.rxRemover) this.rxRemover.unsubscribe();
  }
}

export class DomBody extends ElementProvider {
  constructor(body, className = "") {
    super(body);
    this.className = className;
  }
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add(this.className);
    this.body.appendChild(cell);
  }
}

export class DomComponent extends Component {
  getClassName() { return '' }
  getElementProvider() { return new DomBody(this.body, this.getClassName()); }

  set x( v ){ this.cell.x = v; }
  get x(){ return this.cell.x }
  set y( v ){ this.cell.y = v; }
  get y(){ return this.cell.y }

  set width( v ){ this.cell.width = v; }
  get width(){ return this.cell.width }

  set height( v ){ this.cell.height = v; }
  get height(){ return this.cell.height }

  set visible( v ){ this.cell.visible = v; }
  get visible(){ return this.cell.visible }
}

class AttachEvent {
  constructor(element,event,handler) {
    this.element = element;
    this.event = event;
    this.handler = handler;
  }
}
