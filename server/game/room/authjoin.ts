import { Client } from "colyseus";
import RoomComponent from '../skeleton/roomcomponent'
import axios from "axios";
import { JoinOption, PlayerData } from "../util/interface";
import Command, * as Cmd from  "../util/command";
import * as Brodcast from  "../util/brodcastfactory";
import Debugger from '../util/log';

const FACEBOOK_APP_TOKEN = "295166444484219|Pp5lXBlQuETAezZFYI8Bpml8s2c";


export default class AuthJoin extends RoomComponent {
  players: EntityMap<string> = {};
  debuger: Debugger;
  onInit (options) {
    super.onInit(options);
  }

  onDispose () {
    super.onDispose();
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
    this.players [ client.sessionId ] = options.name;
    this.broadcast( Brodcast.getJoinMsg ( options.name ));
  }

  onLeave (client:Client) {
    this.broadcast( Brodcast.getLeaveMsg ( this.players[ client.sessionId ] ));
    delete this.players[ client.sessionId ];
  }

  getPlayerName(client:Client):string {
    return this.players[ client.sessionId ];
  }

}
