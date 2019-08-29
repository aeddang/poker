import { Client } from "colyseus"
import RoomComponent from '../skeleton/roomcomponent'
import axios from "axios"
import { JoinOption, PlayerData } from "../util/interface"
import Command, * as Cmd from  "../util/command"
import * as Brodcast from  "../util/brodcastfactory"
import Debugger from '../util/log'
import ApiConfig from '../api/config'

export default class AuthJoin extends RoomComponent {
  players: EntityMap<string> = {}
  debuger: Debugger
  onInit (options) {
    super.onInit(options)
  }

  onDispose () {
    super.onDispose()
  }


  async onAuth (options:JoinOption) {
    const response = await axios.request({
      method: 'post',
      url: API_PATH + 'users/autosign/' + options.userId + "?api_key=i" + ApiConfig.API_KEY,
      data: {
        profileImg: options.profileImg,
        name: options.name,
        snsToken: options.accessToken
      }
    });
    if(response.data){
      options.bank = response.data.data.bank
      options.loginToken = response.data.data.loginToken
    }
    return response.data
  }

  onJoin (client:Client, options:JoinOption) {
    this.players [ client.sessionId ] = options.name
    this.broadcast( Brodcast.getJoinMsg ( options.name ))
  }

  onLeave (client:Client) {
    this.broadcast( Brodcast.getLeaveMsg ( this.players[ client.sessionId ] ))
    delete this.players[ client.sessionId ]
  }

  getPlayerName(client:Client):string {
    return this.players[ client.sessionId ]
  }

}
