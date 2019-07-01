import * as Colyseus from "colyseus.js";
import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';
import * as Util from 'Skeleton/util';
import * as Config from "Util/config";
import * as Account from "ViewModel/account";
import * as Page from 'Page/page';
import * as SoundFactory from './soundfactory';
import { ErrorAlert } from  "Util/message";

class RankListBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("rank-list");
    this.body.appendChild(cell);
  }
}

export default class RankList extends Component {
  constructor() {
    super();

  }
  remove() {
    super.remove();
  }

  getElementProvider() { return new RankListBody(this.body); }
  onCreate(elementProvider) {

  }

  setupEvent() {

  }
  
  onResize(data) {

  }

}
