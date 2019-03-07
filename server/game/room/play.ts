import { Client } from "colyseus";
import RoomComponent from '../skeleton/roomcomponent'
import { JoinOption } from "../util/interface"
import Command, * as Cmd from  "../util/command";
import * as Brodcast from  "../util/brodcastfactory";
import Game from "./game/game";
import { GAME_EVENT } from "./game/game";
import Debugger from '../util/log';

const REJOIN_LIMITED_TIME = 20;

export default class Play extends RoomComponent<Game> {
  maxClients = 9;
	ante:number = 1;
  gameRule:number = 2;
  debuger: Debugger;
  onInit (options) {
    super.onInit(options);
    this.setState(new Game(this.ante, this.gameRule, this.maxClients));
    this.state.delegate.subscribe( this.onStateEvent.bind(this) );
  }

  onDispose () {
    this.state.remove();
    super.onDispose();
  }

	onAuth (options:JoinOption) {
    let isJoinAble = this.state.isJoinAble(options.userId);
    return isJoinAble;
  }

  onJoin (client:Client, options:JoinOption) {
    this.state.join(client.sessionId, options);
    this.broadcast( Brodcast.getJoinMsg( options.name ));
  }

  async onLeave (client:Client, consented: boolean) {
    this.state.waiting( client.sessionId );
    try {
      if (consented) throw new Error("consented leave");
      await this.allowReconnection(client, REJOIN_LIMITED_TIME);
      this.state.reJoin( client.sessionId );
    } catch (e) {
      this.broadcast( Brodcast.getLeaveMsg( this.state.leave( client.sessionId ) ));
    }
  }

  onStateEvent(event) {
    switch(event.type) {
      case GAME_EVENT.PUSH :
        this.onPush(event.data);
        break;
    }
  }

  onAction (client:Client, command: Command) {
    super.onAction(client, command);
    this.state.action (client.sessionId, command);
  }

  getPlayerName(client:Client):string {
    return this.state.getPlayerData( client.sessionId ).name
  }
}
