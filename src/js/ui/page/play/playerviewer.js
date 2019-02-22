import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';


class PlayerViewerBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
      <div id='${this.id}card0' class='card'></div>
      <div id='${this.id}card1' class='card'></div>
      <div id='${this.id}card2' class='card'></div>
      <div id='${this.id}card3' class='card'></div>
      <div id='${this.id}card4' class='card'></div>
    `;
  }
}

export default class PlayerViewer extends Component {
  constructor() {
    super();
    this.cards = [];
  }

  remove() {
    super.remove();
    this.cards = null;
  }

  getElementProvider() { return new PlayerViewerBody(this.body); }
  onCreate(elementProvider) {
    for(var i=0; i<5; ++i) this.cards.push(elementProvider.getElement('card'+i));
  }

  onUpdateStatus(status){

  }
}
