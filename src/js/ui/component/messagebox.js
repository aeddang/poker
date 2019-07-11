import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as SoundFactory from 'Root/soundfactory';
import { Confirm } from  "Util/message";
import * as Config from 'Util/config';

class MessageBoxBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("message-box");
    cell.innerHTML =`
    <div class='dimed'></div>
    <div class='box'>
      <div id='${this.id}title' class='title'>제목</div>
      <div id='${this.id}message' class='message'>내용입니다 다다다다다다 내용이지로오롱 내용입니다 다다다다다다</div>
      <div class='box-btns'>
        <button id='${this.id}btnCancel' class='btn-cancel'>cancel</button>
        <button id='${this.id}btnConfirm' class='btn-confirm'>ok</button>
      </div>
    </div>
    `;
    this.body.appendChild(cell);
  }
}

export default class MessageBox extends Component {
  constructor() {
    super();
    this.debuger.tag = 'MessageBox';
  }

  remove() {
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
  }

  setupEvent() {
    this.attachEvent(this.btnConfirm, "click", e => {

    });
    this.attachEvent(this.btnCancel, "click", e => {

    });
  }


}
