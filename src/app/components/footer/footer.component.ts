import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Game } from 'src/app/models/game.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  @Input() game: Game;
  @Input() myTurn = false;
  @Output() handleSkipTurn = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  skipTurn(event) {
    this.handleSkipTurn.emit(event);
  }

}
