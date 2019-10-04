import { Room, EntityMap, Client } from "colyseus"
import { JoinOption, PushData } from "../util/interface"
import Command, * as Cmd from  "../util/command"
import * as Brodcast from  "../util/brodcastfactory"
import * as ApiConfig from  "../api/config"
import Debugger from './log'
import Axios from  'axios';

export default class RoomComponent<T> extends Room<T> {
  debuger: Debugger
  onInit (options) {
    this.debuger = new Debugger(this)
    this.debuger.info("onInit")
  }

  onDispose () {
    this.debuger.info("onDispose")
    this.debuger = null
  }

  async onAuth (options:JoinOption) {
    this.debuger.log(options, 'onAuth')
    try {
      const response = await Axios.post(ApiConfig.API_PATH + 'users/autosign/' + options.userId + ApiConfig.API_QUERY,  {
        profileImg: options.profileImg,
        name: options.name,
        snsToken: options.accessToken
      })
      if( !response.data ) return false
      options.loginToken = response.data.data.loginToken
      options.bank = response.data.data.bank
      options.rank = response.data.data.rank
      options.rid = response.data.data['@rid'];
      options.character = response.data.data.character
      this.debuger.log(options, 'onAuth response')
      let isJoinAble = this.state.isJoinAble(options)
      return isJoinAble
    } catch (error) {
      this.debuger.log(error, 'onAuth error')
      return false;
    }
  }

  onMessage (client:Client, data: Any) {
    let cmd = data.message
    switch(cmd.c) {
      case Cmd.CommandType.Chat : this.onChat(client, cmd); break
      case Cmd.CommandType.Action : this.onAction(client, cmd); break
      case Cmd.CommandType.Push : this.onPush(cmd); break
    }
  }

  getPlayerName(client:Client):string {
    return client.sessionId
  }

  onAction (client:Client, command: Command) {
    this.debuger.log(command,'onAction',0)
  }

  onChat (client:Client, command: Command) {
    this.debuger.log(command,'onChat',0)
    switch(command.t) {
      case Cmd.Chat.Msg :
        this.broadcast( Brodcast.getMsg ( client.sessionId, this.getPlayerName( client ) , command.d ))
        break
    }
  }

  onPush (data:PushData) {
    this.debuger.log(data,'onPush',0)
    let client = this.clients.find( c => { return c.sessionId == data.id })
    if(client == undefined) return
    this.send(client,Brodcast.getPushMsg(client.sessionId, data.value))
  }

}
