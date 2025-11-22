import { Component, Input } from '@angular/core';
import { ScoreComponent } from "./components/score/score.component";
import { BoardComponent } from "./components/board/board.component";
import { ControlsComponent } from "./components/controls/controls.component";

@Component({
  selector: 'app-root',
  imports: [ScoreComponent, BoardComponent, ControlsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  isPaused = false;
  lives: number = 3;
  @Input() externalDirection: string | null = null;
  @Input() pauseSignal: boolean = false;

  togglePauseUI() {
    this.isPaused = !this.isPaused;
    this.pauseSignal = true;
  }

  updateLives(newLives: number) {
    this.lives = newLives;
  }

}
