import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { StartComponent } from './components/start/start.component';

const routes: Routes = [
  {
    path: '', component: StartComponent,
  },
  {
    path: 'game/:id', component: GameComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
