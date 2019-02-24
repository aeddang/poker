import { PlayerData } from "../interface"
import Command, * as Cmd from  "../command";

export default class Player {
  status:boolean = false;
  bankroll:number = 1000;
  isBlind:boolean = false;
  Hand:Array;
  data:PlayerData = null;
  constructor(data:PlayerData) {
    this.data = data;
    this.isBlind = false;
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
