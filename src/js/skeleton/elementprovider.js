import uuidv4 from 'uuid/v4';

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

  getElement(id)
  {
    id = this.id+id;
    return document.getElementById(id);
  }

  getElementID(id)
  {
    return this.id+id;
  }
}
