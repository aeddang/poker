import Component from 'Skeleton/component';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Account from "ViewModel/account";
import CharacterList from 'PageUi/characterlist';
import * as Config from "Util/config";

export const EVENT = Object.freeze ({
	SELECTED_CHARACTER: "selectedCharacter"
});

class JoinBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("popup-join");
    cell.innerHTML =`
      <button id='${this.id}btnClose' class='btn-close'>CLOSE</button>
      <div class='title'>Please select a character</div>
      <div id='${this.id}characterListArea' class='character-list-area'></div>
    `;
    this.body.appendChild(cell);
  }
}

export default class Join extends Component {
  constructor() {
    super();
    this.characterList = new CharacterList();
  }

  init(body, client, options) {
    return super.init(body, client, options);
  }

  remove() {
    super.remove();
    this.characterList.remove();
    this.characterList = null;
    this.btnClose = null;
  }

  getElementProvider() { return new JoinBody(this.body); }
  onCreate(elementProvider) {
    this.characterList.init(elementProvider.getElement('characterListArea'));
    this.btnClose = elementProvider.getElement('btnClose');
    super.onCreate(elementProvider);
    this.onResize();
  }

  setupEvent() {
    this.characterList.delegate.subscribe ( e => {
        this.delegate.next(new ComponentEvent( EVENT.SELECTED_CHARACTER, e));
				window.Poker.closePopup(Config.Popup.Join);
    });
    this.attachEvent(this.btnClose, "click", this.onClosed.bind(this) );
  }

  onResize() {
    super.onResize();
    this.characterList.onResize();
  }

  onClosed() {
    window.Poker.closePopup(Config.Popup.Join);
  }
}
