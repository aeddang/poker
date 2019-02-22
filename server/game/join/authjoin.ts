import { Room, Client } from "colyseus";
import axios from "axios";
import { JoinOption, PlayerData } from "../interface";
import Command, * as Cmd from  "../command";
import * as Brodcast from  "../brodcastfactory";

const FACEBOOK_APP_TOKEN = "295166444484219|Pp5lXBlQuETAezZFYI8Bpml8s2c";

export default class AuthJoin extends Room {
  players: EntityMap<string> = {};

  onInit (options) {
    console.log("init Join");
  }

  onDispose () {
    console.log("dispose Join");
  }

  async onAuth (options:JoinOption) {

    const response = await axios.get('https://graph.facebook.com/debug_token',  {
      params: {
        'input_token': options.accessToken,
        'access_token': FACEBOOK_APP_TOKEN
      }
    });
    return response.data;
  }

  onJoin (client:Client, options:JoinOption) {
    this.players [ client.sessionId ] = options.player;
    this.broadcast( Brodcast.getJoinMsg ( options.player ));
  }

  onLeave (client:Client) {
    this.broadcast( Brodcast.getLeaveMsg ( this.players[ client.sessionId ] ));
    delete this.players[ client.sessionId ];
  }

  onMessage (client:Client, data: Any) {
    let cmd = data.message;
    console.log(cmd);
    switch(cmd.c) {
      case Cmd.CommandType.Chat : this.onChat(client, cmd); break;
    }
  }

  onChat (client:Client, cmd: Command) {
    switch(cmd.t) {
      case Cmd.Chat.Msg : this.broadcast( Brodcast.getMsg ( this.players [ client.sessionId ]  , cmd.d ));  break;
    }
  }


}
