import Debugger from './log';
import { nosync } from "colyseus";
export default class Component {
  @nosync
  debuger: Debugger;

  constructor() {
    this.debuger = new Debugger(this);
    this.debuger.log("constructor", '', 0);
  }

  init () {
    this.debuger.log("init", '', 0);
  }

  remove () {
    this.debuger.log("remove", '', 0);
    this.debuger = null;
  }
}
