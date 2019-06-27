import Component from 'Skeleton/component';
import ElementProvider from 'Skeleton/elementprovider';


class MusicBoxBody extends ElementProvider {
  writeHTML() {
    var cell = document.createElement("div");
    cell.id = this.id+'cell';
    cell.classList.add("position");
    cell.innerHTML = `
      <audio preload='metadata' id='${this.id}bgmPlayer' autoplay loop></audio>
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
    this.isFocus = true;
    this.isOn = true;
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

  toggleSound(){
    if(this.info.isOn) this.soundOff();
    else this.soundOn();
  }

  soundOn(){
    this.info.isOn = true;
    if(this.info.isBgmPlay) this.bgmPlayer.play();
  }

  soundOff(){
    this.info.isOn = false;
    this.bgmPlayer.pause();
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
    this.info.isFocus = false;
  }

  onResume() {
    if(this.info.isBgmPlay) this.bgmPlayer.play();
    this.info.isFocus = true;
  }

  playBgm(path) {
      this.bgmPlayer.src = this.info.path + path + this.info.extension;
      this.debuger.log(this.bgmPlayer.src, 'this.bgmPlayer.src');
      this.bgmPlayer.load();
      this.info.isBgmPlay = true;
  }

  stopBgm() {
      this.bgmPlayer.pause();
      this.info.isBgmPlay = false;
  }

  play(id) {
    this.debuger.log('play ' + id);
    if(!this.info.isFocus) return;
    this.staticPlayers[id].currentTime = 0;
    this.staticPlayers[id].play();
  }

  playEffect(path) {
    this.debuger.log('play ' + path);
    if(!this.info.isFocus) return;
    this.mainPlayer.src = this.info.path + path + this.info.extension;
    this.mainPlayer.load();
    this.mainPlayer.play();
  }

  playSideEffect(path) {
    this.debuger.log('playSide ' + path);
    if(!this.info.isFocus) return;
    this.subPlayer.src = this.info.path + path + this.info.extension;
    this.subPlayer.load();
    this.subPlayer.play();
  }
}
