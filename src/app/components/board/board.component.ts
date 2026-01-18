import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Direction } from './enum/direction';
import { GameService } from '../../services/game.service';
import { AudioService } from '../../services/audio.service';
import { GameState } from './enum/game-state';
import { GameSnapshot } from '../../services/models/game-snapshot';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-board',
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {

  private sub!: Subscription;
  readonly gridSize: number = 10;

  cells: number[] = [];

  snapshot!: GameSnapshot;
  gameState = GameState;
  direction = Direction;
    
  constructor(
    public gameService: GameService,
    private audioService: AudioService,
  ) {}

  /* ======================
     Lifecycle
     ====================== */
  
  ngOnInit() {
    this.cells = Array.from({ length: this.gridSize * this.gridSize}, (_, i) => i);
    
    this.sub = this.gameService.snapshot$.subscribe(s => {
      this.snapshot = s;
      this.handleSideEffects(s);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

   /* ======================
     Inputs
     ====================== */
  
  @HostListener('window:keydown', ['$event'])
  handleKeyBoard(event: KeyboardEvent) {
    if (!this.snapshot) return;

    if (event.code === 'Space') {
      event.preventDefault();
      this.togglePause();
      return;
    };

    switch(event.key) {
      case 'ArrowUp':
        this.gameService.setDirection(Direction.Up);
        break;
      case 'ArrowDown':
        this.gameService.setDirection(Direction.Down);
        break;
      case 'ArrowLeft':
        this.gameService.setDirection(Direction.Left);
        break;
      case 'ArrowRight':
        this.gameService.setDirection(Direction.Right);
        break;
    }
  }

   /* ======================
     Actions
     ====================== */
  
  startGame() {
    this.audioService.unlock();
    this.audioService.startMusic();
    this.gameService.start();
  }

  togglePause() {
    if (!this.snapshot) return;

    if (this.snapshot.state === GameState.Playing) {
      this.gameService.pause();
      this.audioService.pauseMusic();
      this.audioService.pause();
    } else if (this.snapshot.state === GameState.Paused) {
      this.gameService.resume();
      this.audioService.resumeMusic();
      this.audioService.resume();
    }
  }

  restart() {
    this.audioService.stopMusic();
    this.gameService.reset();
  }

   /* ======================
     Side Effects
     ====================== */

  private handleSideEffects(snapshot: GameSnapshot) {
    if (snapshot.state === GameState.GameOver) {
      this.audioService.stopMusic();
      this.audioService.gameOver();
      this.vibrate();
    }
  }

  private vibrate() {
    if ('vibrate' in navigator && window.matchMedia('(pointer: coarse)').matches) {
      navigator.vibrate([400, 120, 400]);
    }
  }

  /* ======================
     UI Helpers
     ====================== */
  
  isSnakeHead(i: number): boolean {
    return this.snapshot.snake[0] === i;
  }

  isSnakeTail(i: number): boolean {
    const s = this.snapshot.snake;
    return !!s && s[s.length - 1] === i;
  }

  isSnakeBody(i: number): boolean {
    return this.snapshot.snake.includes(i) ?? false;
  }

  isFood(i: number): boolean {
    return this.snapshot.food === i;
  }

  snakeColorClass(): string {
    const score = this.snapshot.score ?? 0;
    if (score < 5) return 'snake-level-1';
    if (score < 10) return 'snake-level-2';
    if (score < 20) return 'snake-level-3';
    if (score < 30) return 'snake-level-4';
    return 'snake-level-5';
  }

  get isStart(): boolean {
    return this.snapshot.state === GameState.Start;
  }

  get isGameOver(): boolean {
    return this.snapshot.state === GameState.GameOver;
  }

  get isPause(): boolean {
    return this.snapshot.state === GameState.Paused;
  }

  getCellClasses(i: number): { [key: string]: boolean} {
    const isHead = this.isSnakeHead(i);

    return {
      'snake-head': isHead,
      'snake-body': this.isSnakeBody(i),
      'snake-tail': this.isSnakeTail(i),
      'food': this.isFood(i),
      'snake-head-up': isHead && this.snapshot.direction === Direction.Up,
      'snake-head-down': isHead && this.snapshot.direction === Direction.Down,
      'snake-head-left': isHead && this.snapshot.direction === Direction.Left,
      'snake-head-right': isHead && this.snapshot.direction === Direction.Right,
    }
    
  }

}
