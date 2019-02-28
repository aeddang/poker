
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
      case Sender.AdminLv1 : className='admin-lv1'; header='NOTICE : '; break;
      case Sender.AdminLv2 : className='admin-lv2'; header='NOTICE : '; break;
      case Sender.AdminLv3 : className='admin-lv3'; header='NOTICE : '; break;
      case Sender.User : className='user'; break;
      case Sender.Individual : className='individual'; break;
      case Sender.Push : this.message = JSON.parse(this.message); return;
      default : return;
    }
    this.header = header;
    this.row = document.createElement("p");
    this.row.classList.add(className);
  }

  getViewString() {
    return this.header + this.message;
  }
}

export function parseBrodcast ( data ) {
  return new Brodcast( data );
}
