import Command from "../../util/command";
import { Action, checkCommand } from  "../../util/command";
import { JoinOption } from "../../util/interface";
import { nosync } from "colyseus";

export default class Player {
  status:Status = Status.wait;
  bankroll:number = 1000;
  isBlind:boolean = false;
  userId:string;
  nick:string;
  @nosync
  Hand:Array;

  constructor(options:JoinOption) {
    this.name = options.name;
    this.userId = options.userId;
    this.isBlind = false;
    this.reset();
  }

  reset(){
    this.Hand = [];
    this.status = Status.Wait;
  }

  setActivePlayer(){
    this.status = Status.Active;
  }

  setPassivePlayer(){
    this.status = Status.Passive;
  }

  onAction (command: Command) {
    switch(command.t) {
      case Action.Fold: this.status = Status.Fold; break;
    	case Action.Raise: this.status = Status.Active; break;
      case Action.Check: this.status = Status.Active; break;
    	case Action.Call: this.status = Status.Active; break;
      case Action.Bat: this.status = Status.Active; break;
      case Action.AllIn: this.status = Status.AllIn; break;
    	case Action.Blind: this.isBlind = true; break;
    	case Action.SmallBlind: this.status = Status.Active; break;
    	case Action.BigBlind: this.status = Status.Active; break;
    }
    checkCommand(command);
    console.log(this.status + " : " + this.isBlind);
  }
}

enum Status{
  Wait = 1,
  Fold,
	Active,
  Passive,
  AllIn
}
