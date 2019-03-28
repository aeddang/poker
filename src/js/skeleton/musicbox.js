import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';


class MusicBoxBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("position");
    cell.innerHTML = `
      <audio preload='metadata' loop id='${this.id}bgmPlayer' width='1' height='1'></audio>
      <audio preload='metadata' id='${this.id}mainPlayer'></audio>
      <audio preload='metadata' id='${this.id}subPlayer'></audio>
    `;
    this.body.appendChild(cell);
  }
}

class MusicBoxInfo {
  constructor(path) {
    this.reset();
    this.path = path;
    this.extension = ".mp3";
		this.isBgmPlay = false;
  }
  reset() {}
}

export default class MusicBox extends Component {
  constructor(path) {
    super();
    this.debuger.tag = 'MusicBox';
		this.info = new MusicBoxInfo(path);
    this.staticPlayers = [];
  }

  remove() {
    super.remove();
    this.this.staticPlayers.forEach( p =>{ p.pause() });
    this.bgmPlayer.pause();
    this.mainPlayer.pause();
    this.subPlayer.pause();
    this.bgmPlayer = null;
    this.mainPlayer = null;
    this.subPlayer = null;
    this.this.staticPlayers = null;
  }

  getElementProvider() { return new MusicBoxBody(this.body); }
  onCreate(elementProvider) {
		this.bgmPlayer = elementProvider.getElement('bgmPlayer');
    this.mainPlayer = elementProvider.getElement('mainPlayer');
    this.subPlayer = elementProvider.getElement('subPlayer');
  }

  setupEvent() {
    this.attachEvent(window,"blur",this.onPause.bind(this));
    this.attachEvent(window,"focus",this.onResume.bind(this));
  }

  addStaticSound(path) {
    var audio = document.createElement("audio");
    audio.preload='metadata';
    audio.src = this.info.path + path + this.info.extension;
    audio.load();
    this.cell.appendChild(audio);
    this.staticPlayers.push( audio );
    return this.staticPlayers.length;
  }

  onPause() {
    this.bgmPlayer.pause();
  }

  onResume() {
    if(this.info.isBgmPlay) this.bgmPlayer.play();
  }

  playBgm(path) {
      this.bgmPlayer.src = this.info.path + path + this.info.extension;
      this.bgmPlayer.load();
      this.bgmPlayer.play();
      this.isBgmPlay = true;
  }

  stopBgm() {
      this.bgmPlayer.pause();
      this.isBgmPlay = false;
  }

  play(id) {
    this.staticPlayers[id].currentTime = 0;
    this.staticPlayers[id].play();
  }

  playEffect(path) {
    this.mainPlayer.src = this.info.path + path + this.info.extension;
    this.mainPlayer.load();
    this.mainPlayer.play();
  }

  playSideEffect(path) {
    this.subPlayer.src = this.info.path + path + this.info.extension;
    this.subPlayer.load();
    this.subPlayer.play();
  }
}
