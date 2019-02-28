import Component from 'Skeleton/component';
import ComponentEvent from 'Skeleton/event';
import ElementProvider from 'Skeleton/elementprovider';
import Command, * as Cmd from  "Util/command";
import * as Util from 'Skeleton/util';

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
    <div id='${this.id}viewer' class='viewer'></div>
    <form id='${this.id}inputForm' class='input'>
      <input type="text" id='${this.id}inputText' class='text' value="" autofocus/>
      <input type="submit" id='${this.id}inputBtn' value="send" class='btn' />
    </form>
    `;
    this.body.appendChild(cell);
  }
}

class ChatInfo {
  constructor() {
    this.reset();
		this.maxLow = 500;
  }
  reset() {

  }
}

export default class Chat extends Component  {
  constructor() {
    super();
    this.info = new ChatInfo();
    this.viewer = null;
    this.inputForm = null;
    this.inputText = null;
		this.inputBtn = null;
		this.rows = [];
  }

  remove() {
    super.remove();
		this.rows = null;
    this.info = null;
    this.viewer = null;
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
    this.inputForm = elementProvider.getElement('inputForm');
    this.inputText = elementProvider.getElement('inputText');
		this.inputBtn = elementProvider.getElement('inputBtn');
  }

  setupEvent() {
    this.attachEvent(this.inputForm, "submit", this.onSendMessage.bind(this), true);
  }

  onRoomEvent( event ) {
    if( this.body == null ) return;
    switch(event.type) {
      case CHAT_EVENT.RECEIVED_MESSAGE : this.onReceivedMessage(event.data); break;
    }
  }

	onResize() {
    super.onResize();
		let bounce = Util.convertRectFromDimension(this.getBody());
    let bounceBox = Util.convertRectFromDimension(this.inputForm);
    this.viewer.style.height = Util.getStyleUnit( bounce.height - bounceBox.height );
		let bounceBtn = Util.convertRectFromDimension(this.inputBtn);
		this.inputText.style.width = Util.getStyleUnit( bounce.width - bounceBtn.width );
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
