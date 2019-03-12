// C...
export enum CommandType {
  Chat = 1,
  Action,
  Push
}

// T...
export enum Chat {
  Msg = 1,
  Status
}

export enum Action{
  Fold = 1,
  SmallBlind,
	BigBlind,
  Check,
	Call,
  Bat,
  Raise,
  AllIn,
  Blind,
  JoinGame
}

export default interface Command {
  c:number
  t:number
  d:Any
}
