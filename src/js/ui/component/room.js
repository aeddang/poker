import Component from 'Skeleton/component';
import ComponentEvent from 'Skeleton/event';
import Chat, { CHAT_EVENT } from  "Component/chat";
import * as Account from "ViewModel/account";
import { parseBrodcast, Sender } from 'Util/brodcastfactory';

export default class Room extends Component {
  constructor() {
    super();
    this.room = null;
    this.client = null;
    this.chat = new Chat();
    this.userInfo = null;
    this.ROOM_KEY = '';
  }

  init(body, client, options) {
    this.client = client;
    this.debuger.tag = this.ROOM_KEY;
    return super.init(body);
  }

  remove() {
    super.remove();
    this.client = null;
    if(this.room == null) return;
    this.room.removeAllListeners();
    this.room.leave();
    this.room = null;
    this.userInfo = null;
    this.chat.remove();
    this.chat = null;
  }

  onCreate(elementProvider) {
    super.onCreate(elementProvider);
    this.userInfo = Account.loginModel.getUserData();
  }

  join() {
    this.room = this.client.join(this.ROOM_KEY, {
      accessToken: this.userInfo.accessToken,
      name: this.userInfo.name,
      userId: this.userInfo.id
    });
    this.setupRoomEvent();
  }

  setupRoomEvent() {
    this.room.onJoin.add( this.onJoin.bind(this) );
    this.room.onLeave.add( this.onLeave.bind(this) );
    this.room.onError.add( this.onError.bind(this) );
    this.room.onMessage.add( this.onMessage.bind(this) );
  }

  onChatEvent(event) {
    switch(event.type) {
      case CHAT_EVENT.SEND_MESSAGE : this.room.send({ message: event.data }); break;
    }
  }
  onResize() {
    super.onResize();
    this.chat.onResize();
  }

  onJoin() { this.debuger.log('join', '', 0); }
  onLeave() { this.debuger.log('leave', '', 0); }

  onMessage(message) {
    let brodcast = parseBrodcast(message);
    this.debuger.log(brodcast, 'onMessage', '', 0);
    if( brodcast.sender == Sender.Push ) { this.onPush( brodcast.message); return; }
    this.chat.onRoomEvent( new ComponentEvent( CHAT_EVENT.RECEIVED_MESSAGE,brodcast ) )
    return brodcast;
  }

  onPush(data) {
    this.debuger.log(data, 'onPush', '', 0);
  }

  onError(error) {
    this.debuger.error(error, 'onError!!!');
  }

}
