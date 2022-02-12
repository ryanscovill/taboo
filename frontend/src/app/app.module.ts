import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { StartComponent } from './components/start/start.component';
import { GameComponent } from './components/game/game.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PlayersComponent } from './components/game/players/players.component';
import { JoinDialogComponent } from './components/join-dialog/join-dialog.component';
import { ChatboxComponent } from './components/game/chatbox/chatbox.component';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    GameComponent,
    PlayersComponent,
    JoinDialogComponent,
    ChatboxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
