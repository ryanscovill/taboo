class Player {
  id: string;
  name: string;
  team: number;
  score: number;
  ready: boolean;

  constructor(player: any) {
      this.id = player.id;
      this.name = player.name;
      this.team = player.team;
      this.score = player.score;
      this.ready = player.ready;
  }
}

export { Player };
