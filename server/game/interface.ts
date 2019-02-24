export interface PlayerData {
  nick:String;
  id:String;
  accessToken: string;
}

export interface JoinOption {
  accessToken: string;
  create:boolean;
  player:PlayerData;
}
