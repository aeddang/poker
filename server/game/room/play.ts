import { Room, EntityMap, Client, nosync } from "colyseus";
import { JoinOption } from "../util/interface"
import Command, * as Cmd from  "../util/command";
import * as Brodcast from  "../util/brodcastfactory";
import * as Game from "./game/game";

class State {
  players: EntityMap<Game.Player> = {};
  stage: Game.Stage = new Game.Stage();


  @nosync
  dealler: Game.Dealler = new Game.Dealler();

  join (id: string, options:JoinOption) {
    this.players[ id ] = new Game.Player(options);
  }

  leave (id: string): string {
    let nick = this.players[ id ].name;
    delete this.players[ id ];
    return nick;
  }

  getPlayerData (id: string): PlayerData {
     return this.players[ id ];
  }

  onAction (id: string, command: Command) {
    switch(command.t) {
      case Cmd.Fold:  break;
    	case Cmd.Raise:  break;
      case Cmd.Check:  break;
    	case Cmd.Call:  break;
      case Cmd.Bat:  break;
      case Cmd.AllIn:  break;
    	case Cmd.BlindAction:  break;
    	case Cmd.SmallBlind: break;
    	case Cmd.BigBlind: break;
    }
    this.players[ id ].onAction(command);
  }
}



export default class Play extends Room<State> {
  maxClients = 9;

  onInit (options) {
    console.log("init Game");
    this.setState(new State());
  }

  onDispose () {
    console.log("dispose Game");
  }

  onJoin (client:Client, options:JoinOption) {
    this.state.join(client.sessionId, options);
    this.broadcast( Brodcast.getJoinMsg( options.name ));
  }

  onLeave (client:Client) {
    this.broadcast( Brodcast.getLeaveMsg( this.state.leave( client.sessionId ) ));
  }

  onMessage (client:Client, data: Any) {
    let cmd = data.message;
    console.log(cmd);
    switch(cmd.c) {
      case Cmd.CommandType.Chat : this.onChat(client, cmd); break;
      case Cmd.CommandType.Action : this.onAction(client, cmd); break;
    }
  }

  onAction (client:Client, command: Command) {
    this.state.onAction (client.sessionId, command);
  }

  onChat (client:Client, command: Command) {
    switch(command.t) {
      case Cmd.Chat.Msg :
        console.log(this.state.getPlayerData( client.sessionId ).name);
        this.broadcast( Brodcast.getMsg ( this.state.getPlayerData( client.sessionId ).name , command.d ));  break;
    }
  }
}
