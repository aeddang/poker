import Command, * as Cmd from  "../../util/command";
import { JoinOption } from "../../util/interface";
export default class Player {
  status:Status = Status.wait;
  bankroll:number = 1000;
  isBlind:boolean = false;
  userId:string;
  nick:string;
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

  onAction (id: string, command: Command) {
    switch(command.t) {
      case Cmd.Fold: this.status = Status.Fold; break;
    	case Cmd.Raise: this.status = Status.Active; break;
      case Cmd.Check: this.status = Status.Active; break;
    	case Cmd.Call: this.status = Status.Active; break;
      case Cmd.Bat: this.status = Status.Active; break;
      case Cmd.AllIn: this.status = Status.Allin; break;
    	case Cmd.BlindAction: this.isBlind = true; break;
    	case Cmd.SmallBlind: this.status = Status.Active; break;
    	case Cmd.BigBlind: this.status = Status.Active; break;
    }
  }
}

enum Status{
  Wait = 1,
  Fold,
	Active,
  AllIn
}
