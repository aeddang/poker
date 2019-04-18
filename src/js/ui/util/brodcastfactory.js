
export const Sender = Object.freeze ({
  AdminLv1: '1',
  AdminLv2: '2',
  AdminLv3: '3',
  User: '4',
  Individual: '5',
  Push: '6'
});

const BOUNDERY = '$';

class Brodcast {
  constructor( data ) {

    let datas = data.split(BOUNDERY);
    this.sender = datas[0];
    this.message = datas[1];

    let className = '';
    let header = '';
    switch( this.sender ){
      case Sender.AdminLv1 : className='admin-lv1'; header='<span class="title">Roccat<br> :</span>'; break;
      case Sender.AdminLv2 : className='admin-lv2'; header='<span class="title">Roccat<br> :</span>'; break;
      case Sender.AdminLv3 : className='admin-lv3'; header='<span class="title">Roccat<br> :</span>'; break;
      case Sender.User :
        className='user';
        let msgss = this.message.split("-> ");
        let user = msgss[0];
        let msg = this.message.slice( this.message.indexOf(msgss[1]) );
        header='<span class="title">' + user + '<br> :</span>';
        this.message = msg;
        break;
      case Sender.Individual : className='individual'; break;
      case Sender.Push : this.message = JSON.parse(this.message); return;
      default : return;
    }
    this.message = '<span class="text">' + this.message + '</span>';
    this.header = header;
    this.row = document.createElement("p");
    this.row.classList.add("row")
    this.row.classList.add(className);
  }

  getViewString() {
    return this.header + this.message;
  }
}

export function parseBrodcast ( data ) {
  return new Brodcast( data );
}
