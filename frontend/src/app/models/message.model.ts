class Message {
  gameId: string;
  team: number;
  playerName: string;
  message: string;
  turnWord: boolean;

  constructor(message: any) {
      this.gameId = message.gameId;
      this.team = message.team;
      this.playerName = message.playerName;
      this.message = message.message;
      this.turnWord = message.turnWord;
  }
}

export { Message };
