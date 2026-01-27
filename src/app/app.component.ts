import { Component } from '@angular/core';
import { ScoreComponent } from "./components/score/score.component";
import { BoardComponent } from "./components/board/board.component";
import { ControlsComponent } from "./components/controls/controls.component";
import { AudioService } from './services/audio.service';
import { GameService } from './services/game.service';
import { GameEffectsService } from './services/game-effects.service';
import { Subscription } from 'rxjs';
import { GameState } from './components/board/enum/game-state';

@Component({
  selector: 'app-root',
  imports: [ScoreComponent, BoardComponent, ControlsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  private sub!: Subscription;
  gameState = GameState;
  private lastState: GameState | null = null;
    
  constructor(
    private audioService: AudioService,
    private gameService: GameService,
    private gameEffectsService: GameEffectsService
  ) {}

  ngOnInit(): void {
    this.sub = this.gameService.snapshot$.subscribe(s => {
      if (s.state === this.gameState.GameOver && this.lastState !== this.gameState.GameOver) {
        this.audioService.stopMusic();
        this.audioService.gameOver();
        this.gameEffectsService.vibrate();
      }
      this.lastState = s.state;
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onStart() {
    this.audioService.unlock();
    this.audioService.startMusic();
    this.gameService.start();
  }
  onRestart() {
    this.audioService.stopMusic();
    this.gameService.reset();
  }
}
