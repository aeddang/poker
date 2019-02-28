import { Room, EntityMap, Client, nosync } from "colyseus";
import { JoinOption } from "../util/interface"
import Command, * as Cmd from  "../util/command";
import * as Brodcast from  "../util/brodcastfactory";
import * as Game from "./game/game";
import * as Rx from 'rxjs';
import { take } from 'rxjs/operators';
import Event from  "../util/event";

const WAIT_TIME:number = 2000;

const STATE_EVENT = Object.freeze ({
	PUSH: "push"
});


class State {
  players: EntityMap<Game.Player>;
  stage: Game.Stage;

  @nosync
  dealler: Game.Dealler;
	@nosync
  delegate:Rx.Subject;
	@nosync
	currentPlayer:Player;

  constructor() {
    this.players = {};
    this.dealler = new Game.Dealler();
    this.stage = new Game.Stage();
    this.delegate = new Rx.Subject();
    console.log('constructor');
    this.start();

  }

  remove() {
    this.stage.remove();
    this.delegate.complete();
    for (let id in this.players) this.players[id].remove();
    this.players = null;
    this.delegate = null;
  }

  start(delay){
    this.onGameReset();
    console.log('start');
    Rx.interval(WAIT_TIME).pipe(take(1)).subscribe(e => {
      this.onGameStart();
			let ids = [];
			for (let id in this.players) ids.push(id);
      this.stage.start(ids).subscribe ({
        next :(t) => { this.onGameNextTurn(); },
        complete :() => { this.onGameComplete(); }
      });
			this.setCurrentPlayer();
    });
  }
	setCurrentPlayer(){
		this.currentPlayer = this.players[ this.stage.currentPlayer ];
		this.currentPlayer.setActivePlayer();
	}

  onGameReset(){
    this.stage.reset();
    this.dealler.reset();
    for (let id in this.players) this.players[id].reset();
  }

  onGameStart(){
    console.log('onGameStart');
    for (let id in this.players) {
      let hand = this.dealler.getHand();
      this.players[id].hand = hand;
      this.delegate.next( new Event( STATE_EVENT.PUSH, {id:id, value:hand}) );
    }
  }

  onGameNextTurn(playerId){
		this.setCurrentPlayer();
    console.log('turn complete ');
  }

	onGameComplete(playerId){
		console.log('complete ');
  }

  join (id: string, options:JoinOption) {
    this.players[ id ] = new Game.Player(options);
  }

  leave (id: string): string {
    let nick = this.players[ id ].name;
    delete this.players[ id ];
    return nick;
  }

  getPlayerData (id: string): PlayerData {
     return this.players[ id ];
  }

  onAction (id: string, command: Command) {
    switch(command.t) {
      case Cmd.Fold:  break;
    	case Cmd.Raise:  break;
      case Cmd.Check:  break;
    	case Cmd.Call:  break;
      case Cmd.Bat:  break;
      case Cmd.AllIn:  break;
    	case Cmd.BlindAction:  break;
    	case Cmd.SmallBlind: break;
    	case Cmd.BigBlind: break;
    }
    this.players[ id ].onAction(command);
  }
}



export default class Play extends Room<State> {
  maxClients = 9;

  onInit (options) {
    console.log("init Game");
    this.setState(new State());
    this.state.delegate.subscribe( e => { console.log('eeeee '); } );
  }

  onDispose () {
    console.log("dispose Game");
  }

  onJoin (client:Client, options:JoinOption) {
    this.state.join(client.sessionId, options);
    this.broadcast( Brodcast.getJoinMsg( options.name ));
  }

  onLeave (client:Client) {
    this.broadcast( Brodcast.getLeaveMsg( this.state.leave( client.sessionId ) ));
  }

  onStateEvent(event) {
    switch(event) {
      case STATE_EVENT.PUSH : this.onGamePush(event.data)
    }
  }

  onMessage (client:Client, data: Any) {
    let cmd = data.message;
    switch(cmd.c) {
      case Cmd.CommandType.Chat : this.onChat(client, cmd); break;
      case Cmd.CommandType.Action : this.onAction(client, cmd); break;
    }
  }

  onAction (client:Client, command: Command) {
    this.state.onAction (client.sessionId, command);
  }

  onChat (client:Client, command: Command) {
    switch(command.t) {
      case Cmd.Chat.Msg :
        this.broadcast( Brodcast.getMsg ( this.state.getPlayerData( client.sessionId ).name , command.d ));  break;
    }
  }

  onGamePush (data) {
    let client:Client = clients.find( c => { c.id == data.id } )
    if(client == undefined) return;
    this.send(client,Brodcast.getPushMsg(data.value));
  }

}
