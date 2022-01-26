import { Component, Input, OnInit } from '@angular/core';
import { Player } from 'src/app/models/player.model';

@Component({
  selector: 'game-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss']
})
export class PlayersComponent implements OnInit {

  @Input() players: Player[];
  @Input() currentPlayer: Player;
  @Input() team: number;
  @Input() teamScore: number;

  constructor() { }

  ngOnInit(): void {
  }

}
