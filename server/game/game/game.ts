import { Room, EntityMap, Client, nosync } from "colyseus";
import { JoinOption, PlayerData } from "../interface"
import Command, * as Cmd from  "../command";
import * as Brodcast from  "../brodcastfactory";
import Player from  "./player";
import Stage from  "./stage";
import Dealler from  "./dealler";

class State {
  players: EntityMap<Player> = {};
  stage: Stage = new Stage();

  @nosync
  dealler: Dealler = new Dealler();

  join (id: string, data:PlayerData) {
      this.players[ id ] = new Player(data);
  }

  leave (id: string): string {
    let nick = this.players[ id ].data.nick;
    delete this.players[ id ];
    return nick;
  }

  getPlayerData (id: string): PlayerData {
     return this.players[ id ].data;
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



export default class Game extends Room<State> {
  maxClients = 9;

  onInit (options) {
    console.log("init Game");
    this.setState(new State());
  }

  onDispose () {
    console.log("dispose Game");
  }

  onJoin (client:Client, options:JoinOption) {
    this.state.join(client.sessionId, options.player);
    this.broadcast( Brodcast.getJoinMsg( this.state.getPlayerData( client.sessionId ).nick ));
  }

  onLeave (client:Client) {
    this.broadcast( Brodcast.getLeaveMsg( this.state.leave( client.sessionId ) ));
  }

  onMessage (client:Client, data: Any) {
    let cmd = data.message;
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
      case Cmd.Chat.msg : this.broadcast( Brodcast.getMsg ( this.state.getPlayerData( client.sessionId ).nick , command.d ));  break;
    }
  }
}
