import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Player } from 'src/app/models/player.model';
import { PlayerService } from 'src/app/services/player/player.service';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  gameId: string;
  gameState: string;
  myTurn: boolean;
  myTeam: boolean;
  team1: Player[] = [];
  team2: Player[] = [];

  constructor(
    private socketIoService: SocketioService,
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.gameId = this.route.snapshot.paramMap.get('id');
    if (!this.playerService.player) {
      this.socketIoService.joinGame(this.gameId, this.playerService.createPlayer('player' + Math.floor(Math.random() * 100)));
    }
    this.receiveJoinedPlayers();
    this.receiveGameUpdate();
  }

  receiveJoinedPlayers() {
    this.socketIoService.receiveJoinedPlayers().subscribe((data: string) => {
      this.snackBar.open(data, '', {
        duration: 3000
      })
    });
  };

  receiveGameUpdate() {
    this.socketIoService.receiveGameUpdate().subscribe((data: { players: Player[], state: string, currentPlayerIndex: number }) => {
      console.log(data);
      this.gameState = data.state;
      this.team1 = data.players.filter(player => player.team === 1);
      this.team2 = data.players.filter(player => player.team === 2);
      this.myTurn = (data.currentPlayerIndex !== undefined) && data.players[data.currentPlayerIndex].id === this.playerService.player.id;
      this.myTeam = (data.currentPlayerIndex !== undefined) && data.players[data.currentPlayerIndex].team === data.players.filter(p => p.id === this.playerService.player.id)[0].team
    });
  }

  joinTeam(team: number) {
    this.socketIoService.joinTeam(this.gameId, this.playerService.player.id, team);
  }

  startGame() {
    this.socketIoService.startGame(this.gameId);
  }


}
