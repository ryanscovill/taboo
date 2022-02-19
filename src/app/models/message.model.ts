class Message {
  gameId: string;
  team: number;
  playerName: string;
  playerId: string;
  message: string;

  constructor(message: any) {
      this.gameId = message.gameId;
      this.team = message.team;
      this.playerName = message.playerName;
      this.playerId = message.playerId;
      this.message = message.message;
  }
}

export { Message };
