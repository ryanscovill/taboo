import { Player } from "./player.model";

class Game {
  id: string;
  players: Player[];
  state: string;
  currentPlayerIndex: number;
  turnScore: number;
  word: { word: string, hints: string[] };

  constructor(game: any) {
      this.id = game.id;
      this.players = game.players;
      this.state = game.state;
      this.currentPlayerIndex = game.currentPlayerIndex;
      this.turnScore = game.turnScore;
      this.word = game.word;
  }

  get team1(): Player[] {
    return this.players.filter(player => player.team === 1);
  }

  get team2(): Player[] {
    return this.players.filter(player => player.team === 2);
  }
}

export { Game };
