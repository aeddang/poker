import Component from 'Skeleton/component';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import Command, * as Cmd from  "Util/command";
import * as Util from 'Skeleton/util';
import { animation } from 'Skeleton/animation';
export const CHAT_EVENT = Object.freeze ({
	SEND_MESSAGE: "sendMessage",
  RECEIVED_MESSAGE: "receivedMessage",
});

class ChatBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("chat");
    cell.innerHTML =`
		<div class='body'>
	    <div id='${this.id}viewer' class='viewer scroll-info'></div>
			<div id='${this.id}bottom' class='bottom'>
		    <form id='${this.id}inputForm' class='input'>
		      <input type="text" id='${this.id}inputText' class='text' value=""/>
		      <input type="submit" id='${this.id}inputBtn' value="SEND" class='btn' />
		    </form>
			</div>
		</div>
		<button id='${this.id}btnChat' class='btn-chat'></button>
    `;
    this.body.appendChild(cell);
  }
}

class ChatInfo {
  constructor() {
    this.reset();
		this.maxLow = 500;
		this.isUiHidden = true;
  }
  reset() {

  }
}

export default class Chat extends Component  {
  constructor() {
    super();
		this.debuger.tag = 'Chat';
    this.info = new ChatInfo();
		this.rows = [];
  }

  remove() {
    super.remove();
		this.btnChat = null;
		this.rows = null;
    this.info = null;
    this.viewer = null;
		this.bottom = null;
    this.inputForm = null;
    this.inputText = null;
		this.inputBtn = null;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //PUBLIC start
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //PUBLIC end
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getElementProvider() { return new ChatBody(this.body); }
  onCreate(elementProvider) {
    this.viewer = elementProvider.getElement('viewer');
		this.bottom = elementProvider.getElement('bottom');
    this.inputForm = elementProvider.getElement('inputForm');
    this.inputText = elementProvider.getElement('inputText');
		this.inputBtn = elementProvider.getElement('inputBtn');
		this.btnChat = elementProvider.getElement('btnChat');
  }

  setupEvent() {
    this.attachEvent(this.inputForm, "submit", this.onSendMessage.bind(this), true);
		this.attachEvent(this.btnChat, "click", this.onToggleOpen.bind(this), true);
  }

  onRoomEvent( event ) {
    if( this.body == null ) return;
    switch(event.type) {
      case CHAT_EVENT.RECEIVED_MESSAGE : this.onReceivedMessage(event.data); break;
    }
  }

	onToggleOpen( event ) {

		if(this.info.isUiHidden){
			this.info.isUiHidden = false;
			animation(
        this.getBody().parentNode,{ right: 0 }
      )
		}else{
			this.info.isUiHidden= true;
			let bounce = Util.convertRectFromDimension(this.getBody());
			let bounceBtn = Util.convertRectFromDimension(this.btnChat);
			animation(
        this.getBody().parentNode,{ right: -(bounce.width - bounceBtn.width) }
      )
		}
  }

	onResize() {
    super.onResize();
		let bounce = Util.convertRectFromDimension(this.getBody());
		let bounceBottom = Util.convertRectFromDimension(this.bottom);
		this.viewer.height = bounce.height - bounceBottom.height;
		this.btnChat.y = bounce.height/2;
  }

  onSendMessage(e) {
    e.preventDefault();
    if(this.inputText.value == "") return;
    let command = new Command (
      Cmd.CommandType.Chat,
      Cmd.Chat.Msg,
      this.inputText.value
    );
    this.delegate.next(new ComponentEvent( CHAT_EVENT.SEND_MESSAGE,command ));
  }

  onReceivedMessage(brodcast) {
		let row = brodcast.row;
		this.rows.push(row);
		row.innerHTML = brodcast.getViewString();
    this.viewer.appendChild(brodcast.row);
		this.viewer.scrollTop = this.viewer.scrollHeight;

		if (this.rows.length > this.info.maxLow ) {
			var first = this.rows.shift();
			this.viewer.removeChild(first);
		}

  }
}
