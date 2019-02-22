import { Room, EntityMap, Client, nosync } from "colyseus";
import { JoinOption, PlayerData } from "../interface"
import Command, * as Cmd from  "../command";
import * as Brodcast from  "../brodcastfactory";

class State {
  players: EntityMap<Player> = {};

  @nosync
  //something = "This attribute won't be sent to the client-side";

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

  onReady (id: string, isReady: boolean) {
    this.players[ id ].isReady = isReady;
  }
}

class Player {
  isReady:boolean = false;
  data:PlayerData = null;
  constructor(data:PlayerData) {
    this.data = data;
  }
}

export default class Game extends Room<State> {
  maxClients = 4;

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

  onAction (client:Client, command : Command) {
    /*
    switch(command.t) {
      case Cmd.Action.Ready : this.broadcast( Brodcast.getMsg ( this.players [ client.sessionId ]  , message.d ));  break;
    }
    */
  }

  onChat (client:Client, command: Command) {
    switch(command.t) {
      case Cmd.Chat.msg : this.broadcast( Brodcast.getMsg ( this.state.getPlayerData( client.sessionId ).nick , command.d ));  break;
    }
  }
}
