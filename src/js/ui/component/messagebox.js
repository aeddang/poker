import Component from 'Skeleton/component';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import * as Config from 'Util/config';
import { Subject } from 'rxjs';
class MessageBoxBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("message-box");
    cell.innerHTML =`
    <div class='dimed'></div>
    <div class='box'>
      <div id='${this.id}title' class='title'></div>
      <div id='${this.id}message' class='message'></div>
      <div class='bottom'>
        <div class='box-btns'>
          <button id='${this.id}btnCancel' class='btn-cancel'>cancel</button>
          <button id='${this.id}btnConfirm' class='btn-confirm'>ok</button>
        </div>
      </div>
    </div>
    `;
    this.body.appendChild(cell);
  }
}

export const SELECTED_EVENT = Object.freeze ({
	SELECTED: "selected",
});

class MessageBox extends Component {
  constructor(titleStr="", messageStr="", isCancelAble = false ) {
    super();
    this.attachDelegate = new Subject();
    this.titleStr = titleStr;
    this.messageStr = messageStr;
    this.isCancelAble = isCancelAble;
    this.debuger.tag = 'MessageBox';
  }

  remove() {
    this.attachDelegate.next(0);
    this.attachDelegate.complete(this);
    super.remove();
    this.btnConfirm = null;
    this.btnCancel = null;
    this.title = null;
    this.message = null;
  }

  getElementProvider() { return new MessageBoxBody(this.body); }
  onCreate(elementProvider) {
    this.btnConfirm = elementProvider.getElement('btnConfirm');
    this.btnCancel = elementProvider.getElement('btnCancel');
    this.title = elementProvider.getElement('title');
    this.message = elementProvider.getElement('message');
    this.title.innerHTML = this.titleStr;
    this.message.innerHTML = this.messageStr;
    if( !this.isCancelAble ) this.btnCancel.visible = false;
  }

  setupEvent() {
    this.attachEvent(this.btnConfirm, "click", e => {
      this.delegate.next(new ComponentEvent( SELECTED_EVENT.SELECTED,true));
      this.remove();
    });
    this.attachEvent(this.btnCancel, "click", e => {
      this.delegate.next(new ComponentEvent( SELECTED_EVENT.SELECTED,false));
      this.remove();
    });
  }
}

class MessageBoxController {
  constructor() {
    this.boxes = [];
    this.body = null;
  }

  setupBody(body){
    this.body = body;
  }

  create(title, message, isCancelAble){
    let box = new MessageBox(title, message, isCancelAble);
    this.boxes.push(box);
    box.attachDelegate.subscribe ( b => {
      let find = this.boxes.indexOf(b);
      if(find != -1) this.boxes.splice(find,1);
      console.log("this.boxes " + this.boxes.length);
    });
    return box.init(this.body);
  }

  alert(title, message){
    return this.create(title, message, false);
  }

  confirm(title, message){
    return this.create(title, message, true);
  }
}

export const instence = new MessageBoxController();
