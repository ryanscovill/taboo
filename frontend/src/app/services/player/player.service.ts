import { Injectable } from '@angular/core';
import { Player } from 'src/app/models/player.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  player: Player;

  constructor() { }

  createPlayer(name: string) {
    if (!this.player) {
      this.player = new Player({id: uuidv4(), name: name});
    }
    return this.player;
  }

  updateTeam(team: number) {
    this.player.team = team;
  }
}
