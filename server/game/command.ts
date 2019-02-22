export enum CommandType {
  Chat = 1,
  Action
}

export enum Chat {
  Msg = 1,
  Status
}

export enum Action {
  Ready = 1,
}

export default interface Command {
  c:number;
  t:number;
  d:Any;
}
