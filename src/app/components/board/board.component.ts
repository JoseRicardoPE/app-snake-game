import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Direction } from './enum/direction';
import { GameService } from '../../services/game.service';
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

  @Output() start = new EventEmitter<void>();
  @Output() restart = new EventEmitter<void>();

  readonly gridSize: number = 10;

  private sub!: Subscription;
  cells: number[] = [];
  snapshot!: GameSnapshot;
  gameState = GameState;
  direction = Direction;
    
  constructor(
    public gameService: GameService,
  ) {}

  /* ======================
     Lifecycle
     ====================== */
  
  ngOnInit() {
    this.cells = Array.from({ length: this.gridSize * this.gridSize}, (_, i) => i);

    this.sub = this.gameService.snapshot$.subscribe(s => this.snapshot = s);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /* ======================
     UI Helpers
     ====================== */
  
  isSnakeHead(i: number): boolean {
    return this.snapshot?.snake?.[0] === i;
  }

  isSnakeTail(i: number): boolean {
    const s = this.snapshot?.snake;
    return !!s && s[s.length - 1] === i;
  }

  isSnakeBody(i: number): boolean {
    return this.snapshot?.snake?.includes(i) ?? false;
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
