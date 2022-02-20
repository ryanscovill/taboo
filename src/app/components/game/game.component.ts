import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { GameAction } from 'src/app/models/game-action.model';
import { Game } from 'src/app/models/game.model';
import { Message } from 'src/app/models/message.model';
import { Player } from 'src/app/models/player.model';
import { PlayerService } from 'src/app/services/player/player.service';
import { SocketioService } from 'src/app/services/socketio.service';
import { JoinDialogComponent } from '../join-dialog/join-dialog.component';
import { ChatboxComponent } from './chatbox/chatbox.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChildren('messageBox') messageBoxes: QueryList<ChatboxComponent>;

  gameId: string;
  game: Game;
  myTurn: boolean;
  myTeam: boolean;
  currentPlayer: Player;
  messageList: Message[] = [];
  gameLog: GameAction[] = [];
  newMessage: string;
  cardAction: string;

  correctSound: HTMLAudioElement;
  wrongSound: HTMLAudioElement;
  skipSound: HTMLAudioElement;

  constructor(
    public playerService: PlayerService,
    private socketIoService: SocketioService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.gameId = this.route.snapshot.paramMap.get('id');
    this.playerService.getPlayerFromStorage(this.gameId);

    if (!this.playerService.player) {
      this.openJoinDialog();
    } else {
      this.socketIoService.joinGame(this.gameId, this.playerService.player);
    }

    this.receiveJoinedPlayers();
    this.receiveGameUpdate();
    this.socketIoService.getMessage().subscribe((message: Message) => {
      this.messageList.push(message);
      this.messageBoxes.forEach(messageBox => {
        messageBox.scrollToBottom();
      });
    });
    this.socketIoService.receiveNotification().subscribe((action: GameAction) => {
      this.showCardAction(action.action);
      this.gameLog.push(action);
      this.messageList = [];
      this.messageBoxes.forEach(messageBox => {
        messageBox.scrollToBottom();
      });
    });

    this.socketIoService.receiveServerErrors().subscribe((error: string) => {
      this.snackBar.open(error, '', {
        duration: 5000,
        panelClass: ['red-snackbar']
      });
    });

    this.loadSounds();
  }

  loadSounds() {
    this.correctSound = new Audio();
    this.correctSound.src = '../../../assets/sounds/correct.mp3';
    this.correctSound.load();

    this.wrongSound = new Audio();
    this.wrongSound.src = '../../../assets/sounds/wrong.mp3';
    this.wrongSound.load();

    this.skipSound = new Audio();
    this.skipSound.src = '../../../assets/sounds/skip.mp3';
    this.skipSound.load();
  }

  openJoinDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(JoinDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        data => this.socketIoService.joinGame(this.gameId, this.playerService.createPlayer(data.name, this.gameId))
    );
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
      let newGameUpdate = new Game(data);
      this.game = newGameUpdate;
      this.playerService.updatePlayer(data.players.filter(p => p.id === this.playerService.player.id)[0]);
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
    this.socketIoService.startGame(this.gameId, this.playerService.player.id);
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
    this.socketIoService.badWord(this.gameId, this.playerService.player.id);
  }

  showCardAction(action: string) {
    this.cardAction = action;
    let timeout = 2000;
    switch(action) {
      case 'skipped':
        this.skipSound.play();
        timeout = 2000;
        break;
      case 'wrong':
        this.wrongSound.play();
        timeout = 3000;
        break;
      case 'correct':
        this.correctSound.play();
        timeout = 1000;
        break;
    }
    setTimeout(() => {
      this.cardAction = null;
    }, timeout);
  }

  sendMessage() {
    if (this.newMessage) {
      this.socketIoService.sendMessage(this.gameId, this.playerService.player.team, this.playerService.player.name, this.playerService.player.id, this.newMessage);
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
