export interface PlayerData {
  nick:String;
}

export interface JoinOption {
  accessToken: string;
  create:boolean;
  player:PlayerData;
}
