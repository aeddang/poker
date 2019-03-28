import MusicBox from 'Skeleton/musicbox'

export const BGM = Object.freeze({
    DEFAULT : "bgm"
});

export const STATIC_SOUND = Object.freeze({
    WATER_BOOM : 0,
    SHOT : 1
});

export const SOUND = Object.freeze({
    CONS_PLEASURE : "cons_pleasure",
    GAME_OVER : "game_over",
    CLEAR : "clear",
    SHOT_LONG : "shot_long",
    TIME_OVER : "time_over",
    TICK : "tick",
});

const PATH = "./static/sound/"
let instence = null;

export function getInstence( body = null ) {
  if( instence == null) {
    instence = new MusicBox(PATH);
    instence.init( body );
    instence.addStaticSound("water_boom");
    instence.addStaticSound("shot")
  }
  return instence;
}
