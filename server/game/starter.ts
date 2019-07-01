import * as path from 'path'
import * as express from 'express'
import * as expressip from 'express-ip'
import * as serveIndex from 'serve-index'
import { createServer } from 'http'
import { Server } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import * as Room from './room/room'
import Debugger from './skeleton/log'
import Dealler from './room/game/dealler'

export default function start( port, options ) {
  const debuger = new Debugger("Index")
  const app = express()
  const gameServer = new Server({
    server: createServer(app)
  })
  gameServer.register("play", Room.Play, {custom_options:options})
  /*
  gameServer.register("join_with_options", AuthJoin, {
      custom_options: "you can use me on Room#onInit"
  })
  */
  app.use('/colyseus', monitor(gameServer))

  gameServer.onShutdown(function(){
    debuger.info('game server is going down.')
  })

  gameServer.listen(port)
  debuger.info('Listening on http://localhost:' + port)
}
