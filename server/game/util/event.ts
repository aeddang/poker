export default class Event {
  constructor(type:string,data = null) {
    this.type = type;
    this.data = data;
  }

  toString() {
    if(this.data == null) return this.type;
    return this.type + ' -> ' + JSON.stringify(this.data);
  }
}
