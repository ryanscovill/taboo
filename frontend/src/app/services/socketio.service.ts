import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  socket!: Socket;

  constructor() {
    this.socket = io(environment.SOCKET_ENDPOINT);
   }

  createGame(gameId, player: Player) {
    this.socket.emit('createGame', { gameId: gameId, player: player });
  }

  joinGame(gameId, player: Player) {
    this.socket.emit('joinGame', { gameId: gameId, player: player });
  }

  joinTeam(gameId: string, playerId: string, team: number) {
    this.socket.emit('joinTeam', { gameId: gameId, playerId: playerId, team: team });
  }

  receiveJoinedPlayers() {
    return new Observable((observer) => {
      this.socket.on('joinedGame', (data) => {
        observer.next(data);
      });
    });
  }

  receiveGameUpdate() {
    return new Observable((observer) => {
      this.socket.on('gameUpdate', (data) => {
        observer.next(data);
      });
    });
  }

  startGame(gameId: string) {
    this.socket.emit('startGame', { gameId: gameId });
  }
}