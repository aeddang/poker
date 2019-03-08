import { Room, EntityMap, Client } from "colyseus";
import { JoinOption, PushData } from "../util/interface"
import Command, * as Cmd from  "../util/command";
import * as Brodcast from  "../util/brodcastfactory";
import Debugger from './log';


export default class RoomComponent<T> extends Room<T> {
  debuger: Debugger;
  onInit (options) {
    this.debuger = new Debugger(this);
    this.debuger.info("onInit");
  }

  onDispose () {
    this.debuger.info("onDispose");
    this.debuger = null;
  }

	onAuth (options:JoinOption) {
    let isJoinAble = ( this.state == null ) ? true : this.state.isJoinAble();
    return isJoinAble;
  }

  onMessage (client:Client, data: Any) {
    let cmd = data.message;
    switch(cmd.c) {
      case Cmd.CommandType.Chat : this.onChat(client, cmd); break;
      case Cmd.CommandType.Action : this.onAction(client, cmd); break;
      case Cmd.CommandType.Push : this.onPush(cmd); break;
    }
  }

  getPlayerName(client:Client):string {
    return client.sessionId
  }

  onAction (client:Client, command: Command) {
    this.debuger.log(command,'onAction',0);
  }

  onChat (client:Client, command: Command) {
    this.debuger.log(command,'onChat',0);
    switch(command.t) {
      case Cmd.Chat.Msg :
        this.broadcast( Brodcast.getMsg ( this.getPlayerName( client ) , command.d ));  break;
    }
  }

  onPush (data:PushData) {
    this.debuger.log(data,'onPush',0);
    let client = this.clients.find( c => { return c.sessionId == data.id });
    if(client == undefined) return;
    this.send(client,Brodcast.getPushMsg(data.value));
  }

}
