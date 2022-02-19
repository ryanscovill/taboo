class Player {
  id: string;
  name: string;
  team: number;
  score: number;

  constructor(player: any) {
      this.id = player.id;
      this.name = player.name;
      this.team = player.team;
      this.score = player.score;
  }
}

export { Player };
