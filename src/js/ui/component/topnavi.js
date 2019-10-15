import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as SoundFactory from 'Util/soundfactory';
import { Confirm } from  "Util/message";
import * as Config from 'Util/config';
import * as MessageBoxController from 'Component/messagebox';

class TopNaviBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("top-navi");
    cell.innerHTML =`
    <button id='${this.id}btnSound' class='btn-sound'></button>
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
    this.btnSound = null;
  }

  getElementProvider() { return new TopNaviBody(this.body); }
  onCreate(elementProvider) {
    this.btnSound = elementProvider.getElement('btnSound');
    this.updateSoundStatus();
  }

  updateSoundStatus(){
    if(SoundFactory.getInstence().info.isOn) this.btnSound.classList.add("btn-sound-on")
    else this.btnSound.classList.remove("btn-sound-on")
  }


  setupEvent() {
    this.attachEvent(this.btnSound, "click", this.onSoundChange.bind(this) );
    //this.attachEvent(this.btnExit, "click", this.onExit.bind(this) );
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
