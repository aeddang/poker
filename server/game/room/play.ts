import { Client } from "colyseus"
import RoomComponent from '../skeleton/roomcomponent'
import { JoinOption } from "../util/interface"
import Command, * as Cmd from  "../util/command"
import * as Brodcast from  "../util/brodcastfactory"
import Game from "./game/game"
import { GAME_EVENT } from "./game/game"
import Debugger from '../util/log'
import axios from "axios"

const REJOIN_LIMITED_TIME = 20
const FACEBOOK_APP_TOKEN = "277177683181704|jaDiJtuMu6KF0HGyHpM8ul26c-Y"

export default class Play extends RoomComponent<Game> {
  maxClients = 9
	ante:number = 1
  gameRule:number = 2
  debuger: Debugger
  onInit (options) {
    super.onInit(options)
    if( options ) {
      this.ante = options.ante
      this.gameRule = options.gameRule
    }
    this.setState(new Game(this.ante, this.gameRule, this.maxClients))
    this.state.delegate.subscribe( this.onStateEvent.bind(this) )
  }

  onDispose () {
    this.state.remove()
    super.onDispose()
    this.state = null
  }

	async onAuth (options:JoinOption) {
    this.debuger.log(options, 'onAuth')
    const response = await axios.get('https://graph.facebook.com/debug_token',  {
      params: {
        'input_token': FACEBOOK_APP_TOKEN,
        'access_token': options.accessToken
      }
    })
    if( !response.data ) return false
    let isJoinAble = this.state.isJoinAble(options)
    return isJoinAble
  }

  onJoin (client:Client, options:JoinOption) {
    if(options.sessionId != undefined) {
      this.state.syncJoin( client.sessionId, options.sessionId )
      return;
    }
    this.state.join(client.sessionId, options)
    this.broadcast( Brodcast.getJoinMsg( options.name ))
  }

  async onLeave (client:Client, consented: boolean) {
    this.state.waiting( client.sessionId )
    this.debuger.log(consented, 'consented')
    try {
      if (consented) throw new Error("consented leave")
      await this.allowReconnection(client, REJOIN_LIMITED_TIME)
      this.debuger.log(client.sessionId, 'reJoin')
      this.state.reJoin( client.sessionId )
    } catch (e) {
      let msg = this.state.leave( client.sessionId )
      this.debuger.log(client.sessionId, 'leave')
      if( msg != null )this.broadcast( Brodcast.getLeaveMsg( msg ))
    }
  }

  onStateEvent(event) {
    switch(event.type) {
      case GAME_EVENT.PUSH :
        this.onPush(event.data)
        break
    }
  }

  onAction (client:Client, command: Command) {
    super.onAction(client, command)
    this.state.action (client.sessionId, command)
  }

  getPlayerName(client:Client):string {
    return this.state.getPlayerData( client.sessionId ).name
  }
}
