import * as Config from "Util/config";

const PATH = "./static/asset/"


export const CARD_PATH = PATH + "cards.png"

export const DEFAULT_RANK_GROUP = PATH + "text_group3.png"
export const TOTAL_CHARACTER_TYPE = 5;
export const DEFAULT_CHARACTER = PATH + "character0.png"

export const IconPosition = Object.freeze ({
  BigBlind: PATH + "icon_bb.png",
  SmallBlind: PATH + "icon_sb.png",
  DeallerButton: PATH + "icon_db.png",
});

export const BgPlayerProfile = Object.freeze ({
  Default: PATH + "bg_profile.png",
  ShowDown: PATH + "bg_profile_showdown.png",
  Play: PATH + "bg_profile_play.png",
  Disable: PATH + "bg_profile_disable.png",
  Active: PATH + "bg_profile_active.png"
});

export function getMyLvTitle(bank){
  if(Config.MinBank.Lv4 <= bank) return PATH+"text_my_lv4.png";
  if(Config.MinBank.Lv3 <= bank) return PATH+"text_my_lv3.png";
  if(Config.MinBank.Lv2 <= bank) return PATH+"text_my_lv2.png";
  return PATH+"text_my_lv1.png";

}

export function getMyCharacter(character){
  if(character == null) return DEFAULT_CHARACTER;
  return PATH+"character"+character+".png";
}

export function getLvTitle(lv){
  return PATH+"text_lv"+lv+".png";
}

export function getLvIcon(lv){
  return PATH+"icon_lv"+lv+".png";
}

export function getMyRankGroup(rankGroup){
  if(rankGroup == null) return DEFAULT_RANK_GROUP;
  return PATH+"text_group"+rankGroup+".png";
}
