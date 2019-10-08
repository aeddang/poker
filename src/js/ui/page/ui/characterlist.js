import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Account from "ViewModel/account";

import * as ImageFactory from 'Util/imagefactory';

class CharacterListBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("character-list");
    this.body.appendChild(cell);
  }
}

class ListItemBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("item");
    cell.innerHTML = `
      <img id='${this.id}characterImg' class='character-img'></img>
      <button id='${this.id}btn' class='btn'></button>
    `;
    this.body.appendChild(cell);
  }
}

class ListData {
  constructor() {
  }

  setData(idx) {
    this.character = idx;
  }
}

export default class CharacterList extends Component {
  constructor() {
    super();
  }

  remove() {
    super.remove();
  }

  getElementProvider() { return new CharacterListBody(this.body); }
  onCreate(elementProvider) {
     for(var i =0 ; i <= ImageFactory.TOTAL_CHARACTER_TYPE; ++i){
       let item = new ListItem();
       item.data = new ListData();
       item.data.setData(i);
       item.init( this.getBody() ).subscribe ( e => { this.delegate.next(e) } );
     }
  }
  onResize(data) {

  }

}

class ListItem extends Component {
  constructor() {
    super();
  }

  remove() {
    super.remove();
    this.data = null;
    this.characterImg = null;
    this.btn = null;
  }

  getElementProvider() { return new ListItemBody(this.body); }
  onCreate(elementProvider) {
    this.characterImg = elementProvider.getElement('characterImg');
    this.btn = elementProvider.getElement('btn');
    this.characterImg.src = ImageFactory.getMyCharacter(this.data.character);

  }

  setupEvent() {
    this.attachEvent(this.btn, "click", e => {
        this.delegate.next(this.data.character);
    } );
  }

}
