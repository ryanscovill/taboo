class GameAction {
  gameId: string;
  team: number;
  message: string;
  action: string;
  word: string;
  playerName: string;

  constructor(message: any) {
      this.gameId = message.gameId;
      this.action = message.action;
      this.playerName = message.playerName;
      this.word = message.word;
  }
}

export { GameAction };
