class GameAction {
  gameId: string;
  team: number;
  message: string;
  action: string;
  word: string;
  playerName: string;
  playerId: string;

  constructor(message: any) {
      this.gameId = message.gameId;
      this.action = message.action;
      this.playerName = message.playerName;
      this.playerId = message.playerId;
      this.word = message.word;
  }
}

export { GameAction };
