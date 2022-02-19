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
      localStorage.setItem('player', JSON.stringify(this.player));
    }
    return this.player;
  }

  updatePlayer(player: Player) {
    this.player = new Player(player);
    localStorage.setItem('player', JSON.stringify(this.player));
  }

  getPlayerFromStorage(): void {
    this.player = localStorage.getItem('player') ? JSON.parse(localStorage.getItem('player')) : null;
  }
}
