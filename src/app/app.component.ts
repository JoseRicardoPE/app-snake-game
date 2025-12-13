import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
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
  @ViewChild('boardRef', { read: ElementRef })
  boardRef!: ElementRef<HTMLElement>;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private swipeStartInsideBoard: boolean = false;
  private readonly SWIPE_THRESHOLD: number = 30; // Sensibilidad del swipe

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

  // Detectar swipe en dispositivos táctiles y sólo si el swipe comienza dentro del tablero
  @HostListener('touchstart', ['$event']) 
  onTouchStart(event: TouchEvent) {
    const target = event.target as HTMLElement;

    if (this.boardRef && this.boardRef.nativeElement.contains(target)) {
      this.swipeStartInsideBoard = true;
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    } else {
      this.swipeStartInsideBoard = false;
    }
  }

  // Ejecutar swipe solo si comenzó dentro del tablero
  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {

    // Para evitar que swipe funcione cuando el juego está en pausa
    if (!this.swipeStartInsideBoard || this.isPaused) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;

    // Evitar micromovimientos
    if (Math.abs(deltaX) < this.SWIPE_THRESHOLD && Math.abs(deltaY) < this.SWIPE_THRESHOLD) {
      return;
    }

    // Horizontal vs Vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.externalDirection = deltaX > 0 ? 'ArrowRight' : 'ArrowLeft';
    } else {
      this.externalDirection = deltaY > 0 ? 'ArrowDown' : 'ArrowUp';
    }
  }

}
