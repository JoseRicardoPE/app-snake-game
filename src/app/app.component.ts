import { Component, HostListener, Input } from '@angular/core';
import { ScoreComponent } from "./components/score/score.component";
import { BoardComponent } from "./components/board/board.component";
import { ControlsComponent } from "./components/controls/controls.component";
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  imports: [ScoreComponent, BoardComponent, ControlsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  @Input() externalDirection: string | null = null;
  isPaused = false;
  lives: number = 1;
  score: number = 0;
  highScore: number = 0;

  constructor(
    private gameService: GameService,
  ) {}

  ngOnInit() {
    this.highScore = this.gameService.getHighScore();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyEvent(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
      this.togglePause();
    }
  }

  updateLives(newLives: number) {
    this.lives = newLives;
  }

  updateScore(newScore: number) {
    this.score = newScore;
    this.highScore = this.gameService.getHighScore();
  }

}
