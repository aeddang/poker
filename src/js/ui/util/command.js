export const CommandType = Object.freeze ({
	Chat: 1,
	Action: 2,
	Push: 3
});

export const Chat = Object.freeze ({
  Msg: 1,
  Status: 2
});

export const Action = Object.freeze ({
	Fold: 1,
  SmallBlind: 2,
	BigBlind: 3,
  Check: 4,
	Call: 5,
  Bet: 6,
  Raise: 7,
  AllIn: 8,
  Blind: 9
});

export default class Command {
  constructor(command, type = 1, data = null) {
    this.c = command;
    this.t = type;
    this.d = data;
  }
}
