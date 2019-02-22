export default class ComponentEvent {
  constructor(type,data = null) {
    this.type = type;
    this.data = data;
  }

  toString() {
    if(this.data == null) return this.type;
    return this.type + ' -> ' + JSON.stringify(this.data);
  }
}


export class MoveEvent extends ComponentEvent {}
export const MOVE_EVENT = Object.freeze ({
	START: "start",
	MOVE: "move",
  END:"end"
});
