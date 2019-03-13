import uuidv4 from 'uuid/v4';
import { decoratorDynamicDom } from 'Skeleton/uielement';
import Debugger from './log';


export default class ElementProvider {
	constructor(body,id="") {
		id = id=="" ? ( "E" + uuidv4() ) : id;
    this.body = body;
    this.id = id;
  }

  init() { }

  remove() {
    this.body.innerHTML = "";
  }

  writeHTML() { }

  getElement(id) {
    id = this.id+id;
    return decoratorDynamicDom( document.getElementById(id), id );
  }

  createElement(dom) {
    return decoratorDynamicDom( document.createElement(dom) );
  }

  getElementID(id) {
    return this.id+id;
  }
}
