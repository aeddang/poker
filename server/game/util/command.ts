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
  SmallBlind,
	BigBlind,
  Check,
	Call,
  Bat,
  Raise,
  AllIn,
  Blind
}

export function checkCommand ( command:Command):string {
  var arr = ["None"];
  switch(command.c) {
    case CommandType.Chat : arr = arr.concat(['Msg','Status']); break;
    case CommandType.Action : arr = arr.concat(['Fold', 'SmallBlind', 'BigBlind', 'Check', 'Call', 'Bat', 'Raise', 'AllIn', 'Blind']); break;
  }
  console.log(arr[command.t] + ' -> ');
  console.log(command.d);
}


export default interface Command {
  c:number;
  t:number;
  d:Any;
}
