import * as path from 'path';
import * as express from 'express';
import * as expressip from 'express-ip';
import * as serveIndex from 'serve-index';
import { createServer } from 'http';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';

import AuthJoin from "./join/authjoin";
import Game from "./game/game";

const port = Number(process.env.PORT || 2567);
const app = express();

const gameServer = new Server({
  server: createServer(app)
});

gameServer.register("join", AuthJoin);
gameServer.register("game", Game);

/*
gameServer.register("join_with_options", AuthJoin, {
    custom_options: "you can use me on Room#onInit"
});
*/
app.use('/colyseus', monitor(gameServer));

gameServer.onShutdown(function(){
  console.log('game server is going down.');
});

gameServer.listen(port);
console.log('Listening on http://localhost:' + port);
