export enum CommandType {
  Chat = 1,
  Action
}

export enum Chat {
  Msg = 1,
  Status
}

export enum Action{
  Fold = 1,
	Raise,
  Check,
	Call,
  Bat,
  AllIn,
	BlindAction,
	SmallBlind,
	BigBlind
}

export default interface Command {
  c:number;
  t:number;
  d:Any;
}
