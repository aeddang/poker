import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as SoundFactory from 'Root/soundfactory';
import { Confirm } from  "Util/message";
import * as Config from 'Util/config';
import * as MessageBoxController from 'Component/messagebox';

class TopNaviBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("top-navi");
    cell.innerHTML =`
    <button id='${this.id}btnExit' class='btn-exit'></button>
    <button id='${this.id}btnSound' class='btn-sound'></button>
    <button id='${this.id}btnEvent' class='btn-event'></button>
    <button id='${this.id}btnEvent2' class='btn-event-2'></button>
    `;
    this.body.appendChild(cell);
  }
}

export default class TopNavi extends Component {
  constructor() {
    super();
    this.debuger.tag = 'TopNavi';
  }

  remove() {
    super.remove();
    this.btnExit = null;
    this.btnSound = null;
    this.btnEvent = null;
    this.btnEvent2 = null;
  }

  getElementProvider() { return new TopNaviBody(this.body); }
  onCreate(elementProvider) {
    this.btnExit = elementProvider.getElement('btnExit');
    this.btnSound = elementProvider.getElement('btnSound');
    this.btnEvent = elementProvider.getElement('btnEvent');
    this.btnEvent2 = elementProvider.getElement('btnEvent2');
    this.updateSoundStatus();
  }

  updateSoundStatus(){
    if(SoundFactory.getInstence().info.isOn) this.btnSound.classList.add("btn-sound-on")
    else this.btnSound.classList.remove("btn-sound-on")
  }


  setupEvent() {
    this.attachEvent(this.btnSound, "click", this.onSoundChange.bind(this) );
    this.attachEvent(this.btnExit, "click", this.onExit.bind(this) );
    //this.attachEvent(this.btnEvent, "click", this.onLoginChange.bind(this) );
    //this.attachEvent(this.btnEvent2, "click", this.onLoginChange.bind(this) );
  }

  onSoundChange() {
    SoundFactory.getInstence().toggleSound();
    this.updateSoundStatus();
  }

  onExit() {
    MessageBoxController.instence.confirm("",Confirm.ExitGame).subscribe(e=>{
      switch (e.data) {
        case 1:
          Poker.pageChange(Config.Page.Home);
          break;
        default:
          break;
      }
    });
  }

}
