import Component from 'Skeleton/component';
import ComponentEvent from 'Skeleton/event';
import Chat, { CHAT_EVENT } from  "Component/chat";
import * as Login from "ViewModel/login";

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
    this.userInfo = Login.model.getUserData();
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

  onJoin() { console.log('join'); }
  onLeave() { console.log('leave'); }

  onMessage(message) {
    this.chat.onRoomEvent( new ComponentEvent( CHAT_EVENT.RECEIVED_MESSAGE,message ) )
  }

  onError(error) {
    console.log('onError!!!');
    console.log(error);
  }

}
