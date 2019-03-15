export const Status = Object.freeze ({
  Wait: 1,
  Impossible: 2,
  Fold: 3,
	Play: 4,
  AllIn: 5,
  ShowDown: 6,
  Absence: 7,
  WaitBigBlind: 8
});

export const PositionStatus= Object.freeze ({
  None: 1,
  DeallerButton: 2,
  SmallBlind: 3,
  BigBlind: 4
});

export const NetworkStatus = Object.freeze ({
  Connected: 1,
  DisConnected: 2,
  Wait: 3
});
