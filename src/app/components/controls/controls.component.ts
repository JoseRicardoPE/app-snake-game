import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameSnapshot } from '../../services/models/game-snapshot';
import { GameState } from '../board/enum/game-state';
import { Direction } from '../board/enum/direction';
import { GameService } from '../../services/game.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-controls',
  imports: [CommonModule],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.scss'
})
export class ControlsComponent {
  private sub!: Subscription;

  snapshot!: GameSnapshot;
  gameState = GameState;
  direction = Direction;
  
  constructor(
    private gameService: GameService,
    private audioService: AudioService,
  ) {}

  ngOnInit(): void {
    this.sub = this.gameService.snapshot$.subscribe(s => this.snapshot = s);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /* ======================
     Actions
     ====================== */
  
  move(dir: Direction) {
    this.gameService.setDirection(dir);
  }

  togglePlayPause(): void {
    if (!this.snapshot) return;

    switch (this.snapshot.state) {
      case this.gameState.Start:
        this.audioService.unlock();
        this.audioService.startMusic();
        this.gameService.start();
        break;
      case this.gameState.Playing:
        this.audioService.pauseMusic();
        this.gameService.pause();
        break;
      case this.gameState.Paused:
        this.audioService.resumeMusic();
        this.gameService.resume();
        break;
    }
  }
  
  toggleMute(): void {
    this.audioService.setMuted(!this.audioService.isMuted());
  }

  restart(): void {
    this.audioService.stopMusic();
    this.gameService.reset();
  }

  /* ======================
    UI helpers
    ====================== */

  get isPaused(): boolean {
    return this.snapshot.state === this.gameState.Paused || this.snapshot.state === this.gameState.Start;
  }

  get isGameOver(): boolean {
    return this.snapshot.state === this.gameState.GameOver;
  }

  get isMuted(): boolean {
    return this.audioService.isMuted();
  }

  @HostListener('window:keydown', ['$event'])
  handlekey(e: KeyboardEvent) {
    if (e.code === 'Space') this.togglePlayPause();
  }
}
