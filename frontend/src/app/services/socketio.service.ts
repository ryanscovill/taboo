import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Message } from '../models/message.model';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  socket!: Socket;
  private message$ = new ReplaySubject<Message>(1);

  constructor() {
    this.socket = io(environment.SOCKET_ENDPOINT);
   }

  createGame(gameId, turnTime: number, player: Player) {
    this.socket.emit('createGame', { gameId: gameId, turnTime: turnTime, player: player });
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

  receiveNotification() {
    return new Observable((observer) => {
      this.socket.on('notification', (data) => {
        observer.next(data);
      });
    });
  }

  startGame(gameId: string) {
    this.socket.emit('startGame', { gameId: gameId });
  }

  startMyTurn(gameId: string) {
    this.socket.emit('startTurn', { gameId: gameId });
  }

  skipTurn(gameId: string) {
    this.socket.emit('skipTurn', { gameId: gameId });
  }

  skipWord(gameId: string) {
    this.socket.emit('skipWord', { gameId: gameId });
  }

  badWord(gameId: string) {
    this.socket.emit('badWord', { gameId: gameId });
  };

  sendMessage(gameId: string, team: number, playerName: string, message: string) {
    this.socket.emit('message', { gameId: gameId, team: team, playerName: playerName, message: message });
  }

  getMessage() {
      this.socket.on('message', (data) => {
        this.message$.next(data);
      });
      return this.message$;
  }
}
