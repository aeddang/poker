import SyncPropsComponent from 'Component/syncpropscomponent';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';


class GameViewerBody extends ElementProvider {
  writeHTML() {
  this.body.innerHTML = `
    <div>
      <div id='${this.id}ante' class='ante'></div>
      <div id='${this.id}mainPot' class='main-pot'></div>
      <div id='${this.id}sidePot' class='side-pot'></div>
    </div>
    <div id='${this.id}card0' class='card'></div>
    <div id='${this.id}card1' class='card'></div>
    <div id='${this.id}card2' class='card'></div>
    <div id='${this.id}card3' class='card'></div>
    <div id='${this.id}card4' class='card'></div>
    `;
  }
}

export default class GameViewer extends SyncPropsComponent {
  constructor() {
    super();
    this.debuger.tag = 'GameViewer';
    this.cards = [];
  }

  remove() {
    super.remove();
    this.cards = null;
    this.ante = null;
    this.mainPot = null;
    this.sidePot = null;
  }

  getElementProvider() { return new GameViewerBody(this.body); }
  onCreate(elementProvider) {
    this.ante = elementProvider.getElement('ante');
    this.mainPot = elementProvider.getElement('mainPot');
    this.sidePot = elementProvider.getElement('sidePot');
    for(var i=0; i<5; ++i) this.cards.push(elementProvider.getElement('card'+i));
  }
  setupWatchs(){
    this.watchs = {
      ante: value =>{
        this.debuger.log(value, 'ante');
      },
      mainPot: value =>{
        this.debuger.log(value, 'mainPot');
      },
      sidePot: value =>{
        this.debuger.log(value, 'sidePot');
      },
      status: value =>{
        this.debuger.log(value, 'status');
      },
      communityCards: value =>{
        this.debuger.log(value, 'communityCards');
      }
    };
  }
}

export const Status = Object.freeze ({
  Wait: 1,
  Play: 2,
  Complete: 3
});
