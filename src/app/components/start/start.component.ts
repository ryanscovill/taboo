import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from 'src/app/services/player/player.service';
import { SocketioService } from 'src/app/services/socketio.service';
import ShortUniqueId from 'short-unique-id';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HelpComponent } from '../help/help.component';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {
  startForm: FormGroup;

  constructor(private router: Router,
    private playerService: PlayerService,
    private socketioService: SocketioService,
    private route: ActivatedRoute,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.clearLocalStorage();
    this.startForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      turnTime: new FormControl(120, [Validators.required]),
      rounds: new FormControl(3, [Validators.required])
    });
  }

  clearLocalStorage() {
    localStorage.removeItem('player');
  };

  createGame() {
    const gameId = new ShortUniqueId()();
    this.playerService.createPlayer(this.startForm.get('name').value, gameId);
    this.socketioService.createGame(gameId, this.startForm.get('turnTime').value, this.startForm.get('rounds').value, this.playerService.player);
    this.router.navigate(['/game', gameId])
  }

  openHelpDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    this.dialog.open(HelpComponent, dialogConfig);
  }
}
