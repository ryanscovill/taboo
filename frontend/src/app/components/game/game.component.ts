import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Game } from 'src/app/models/game.model';
import { Message } from 'src/app/models/message.model';
import { Player } from 'src/app/models/player.model';
import { PlayerService } from 'src/app/services/player/player.service';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('messageListElement') private scrollContainer: ElementRef;

  gameId: string;
  game: Game;
  myTurn: boolean;
  myTeam: boolean;
  currentPlayer: Player;
  messageList: Message[] = [];
  newMessage: string;
  cardAction: string;

  constructor(
    public playerService: PlayerService,
    private socketIoService: SocketioService,
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
    this.socketIoService.getMessage().subscribe((message: Message) => {
      this.messageList.push(message);
      if (this.scrollContainer) {
        setTimeout(() => this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight);
      }
    });
    this.socketIoService.receiveNotification().subscribe((action: string) => {
      this.showCardAction(action);
    });
  }

  receiveJoinedPlayers() {
    this.socketIoService.receiveJoinedPlayers().subscribe((data: string) => {
      this.snackBar.open(data, '', {
        duration: 3000
      })
    });
  };

  receiveGameUpdate() {
    this.socketIoService.receiveGameUpdate().subscribe((data: Game) => {
      // console.log(data);
      this.playerService.updatePlayer(data.players.filter(p => p.id === this.playerService.player.id)[0]);
      let newGameUpdate = new Game(data);
      this.game = newGameUpdate;
      if (data.currentPlayerIndex !== undefined) {
        this.currentPlayer = data.players[data.currentPlayerIndex];
        this.myTurn = this.currentPlayer.id === this.playerService.player.id;
        this.myTeam = this.currentPlayer.team === this.playerService.player.team
      }
      if (this.game.state === 'between_round') {
        this.messageList = [];
      }
    });
  }

  joinTeam(team: number) {
    this.socketIoService.joinTeam(this.gameId, this.playerService.player.id, team);
  }

  startGame() {
    this.socketIoService.startGame(this.gameId);
  }

  startMyTurn() {
    this.socketIoService.startMyTurn(this.gameId);
  }

  skipTurn() {
    this.socketIoService.skipTurn(this.gameId);
  }

  skipWord() {
    this.socketIoService.skipWord(this.gameId);
  }

  badWord() {
    this.socketIoService.badWord(this.gameId);
  }

  showCardAction(action: string) {
    this.cardAction = action;
    let timeout = 2000;
    switch(action) {
      case 'wrong':
        timeout = 3000;
        break;
      case 'correct':
        timeout = 1000;
        break;
    }
    setTimeout(() => {
      this.cardAction = null;
    }, timeout);
  }

  sendMessage() {
    if (this.newMessage) {
      this.socketIoService.sendMessage(this.gameId, this.playerService.player.team, this.playerService.player.name, this.newMessage);
      this.newMessage = '';
    }
  }

  formatSeconds(timeInSeconds: number): string {
    const str_pad_left = (string,pad,length) => {
      return (new Array(length+1).join(pad)+string).slice(-length);
    }
    if(this.game?.timer) {
      let minutes = Math.floor(timeInSeconds / 60);
      var seconds = timeInSeconds - minutes * 60;
      return str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
    }
    return '';
  }

  get title(): string {
    if (this.game?.state === 'playing') {
      if (this.myTurn) {
        return 'Your Turn';
      }
      if (this.myTeam && !this.myTurn) {
        return 'Guess';
      }
      if (!this.myTeam) {
        return 'Listen';
      }
    }
    return ' ';
  }

}
