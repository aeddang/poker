import { Subject,timer} from 'rxjs';

export default class Component {
  constructor(delegate = new Subject()) {
    this.delegate = delegate;
    this.body = null;
    this.cell = null;
    this.isDown = false;
    this.attachEvents = [];
  }

  init(body) {
    if( typeof(body) == 'string' ) body = document.getElementById(body);
    this.body = body;
    this.createElements();
    this.createObservable();
    this.setupEvent();
    return this.delegate;
  }

  getBody() {
    return (this.cell) ? this.cell : this.body;
  }

  remove() {
    if(this.delegate == null) return;
    this.delegate.complete(this);
    this.clearEvent();
    if(this.cell == null) this.body.innerHTML = "";
    else if(this.cell.parentNode) this.cell.parentNode.removeChild(this.cell);
    this.delegate = null;
    this.cell = null;
    this.body = null;
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

  createObservable(){}

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
    this.attachEvents.forEach((evt) => {
        evt.element.removeEventListener(evt.event,evt.handler);
    });
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
    this.rxInitAni = Observable.timer(delay).timeInterval().take(1).subscribe (
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


class AttachEvent
{
  constructor(element,event,handler)
  {
    this.element = element;
    this.event = event;
    this.handler = handler;
  }
}
