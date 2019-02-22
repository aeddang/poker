export const CommandType = Object.freeze ({
	Chat: 1,
	Action: 2
});

export const Chat = Object.freeze ({
  Msg: 1,
  Status: 2
});

export const Action = Object.freeze ({
	Ready: 1
});

export default class Command {
  constructor(command, type = 1, data = null) {
    this.c = command;
    this.t = type;
    this.d = data;
  }
}
