import MusicBox from 'Skeleton/musicbox'

export const BGM = Object.freeze({
    DEFAULT : "bgm"
});

export const STATIC_SOUND = Object.freeze({
    THROW_CARD : 0,
    TICK_TIME : 1,
    DROP_POT : 2
});

export const SOUND = Object.freeze({
    WIN : "win",
    LOSE : "lose",
    TURN : "turn",
    FOLD : "fold",
    CALL : "call",
    BET : "bet",
    ALL_IN : "all_in"
});

export const SUB_SOUND = Object.freeze({
    SHUFFLE_CARD : "shuffle_card",
    TAKE_POT : "take_pot",
    FLIP_CARD : "flip_card"
});

const PATH = "./static/sound/"
let instence = null;

export function getInstence( body = null ) {
  if( instence == null) {
    instence = new MusicBox(PATH);
    instence.init( body );
    instence.addStaticSound("throw_card");
    instence.addStaticSound("tick_time");
    instence.addStaticSound("drop_pot");
  }
  return instence;
}
