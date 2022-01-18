class Player {
  id: string;
  name: string;
  team: number;

  constructor(player: any) {
      this.id = player.id;
      this.name = player.name;
      this.team = player.team;
  }
}

export { Player };
