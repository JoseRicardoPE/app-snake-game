import { Injectable } from '@angular/core';
import { GameSnapshot } from './models/game-snapshot';
import { GameState } from '../components/board/enum/game-state';
import { Direction } from '../components/board/enum/direction';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly HIGH_SCORE_KEY = 'snake_game_high_score';
  private readonly GRID_SIZE = 10;
  private readonly BASE_SPEED = 600;
  
  private loop: any = null;

  private state: GameSnapshot = {
    state: GameState.Start,
    direction: Direction.Right,
    snake: [],
    food: 0,
    score: 0,
    speed: this.BASE_SPEED,
    highScore: this.getHighScore()
  }

  private snapshotSubject = new BehaviorSubject<GameSnapshot>(this.state);
  snapshot$ = this.snapshotSubject.asObservable();

  /*  ======================
      Public API
      ======================  */
  
  start() {
    if (this.state.state !== GameState.Start) return;

    this.resetState();
    this.state.state = GameState.Playing;
    this.emit();
    this.startLoop();
  }

  pause() {
    if (this.state.state !== GameState.Playing) return;
    this.state.state = GameState.Paused;
    this.emit();
  }

  resume() {
    if (this.state.state !== GameState.Paused) return;
    this.state.state = GameState.Playing;
    this.emit();
  }

  reset() {
    this.stopLoop();
    this.state.state = GameState.Start;
    this.emit();
  }
  
  gameOver() {
    if (this.state.state === GameState.GameOver) return;
    this.state.state = GameState.GameOver;
    this.stopLoop();
    this.setHighScore(this.state.score);
    this.emit();
  }

  setDirection(direction: Direction) {
    const opposite = {
      [Direction.Up]: Direction.Down,
      [Direction.Down]: Direction.Up,
      [Direction.Left]: Direction.Right,
      [Direction.Right]: Direction.Left,
    }

    if (direction !== opposite[this.state.direction]) {
      this.state.direction = direction;
      this.emit();
    }
  }

  /*  ======================
      Game Loop Management
      ======================  */

  private startLoop() {
    this.stopLoop();
    this.loop = setInterval(() => {
      this.tick();
    }, this.state.speed);
  }

  private stopLoop() {
    if (this.loop) {
      clearInterval(this.loop);
      this.loop = null;
    }
  }

  private tick() {
    if (this.state.state !== GameState.Playing) return;

    const head = this.state.snake[0];
    let next = head;

    const col = head % this.GRID_SIZE;
    const total = this.GRID_SIZE * this.GRID_SIZE;

    switch (this.state.direction) {
      case Direction.Up: next -= this.GRID_SIZE; break;
      case Direction.Down: next += this.GRID_SIZE; break;
      case Direction.Left:
        if (col === 0) return this.gameOver();
        next -= 1;
        break;
      case Direction.Right:
        if (col === this.GRID_SIZE - 1) return this.gameOver();
        next += 1;
        break;
    }

    if (next < 0 || next >= total || this.state.snake.includes(next)) {
      this.gameOver();
      return;
    }

    this.state.snake.unshift(next);

    if (next === this.state.food) {
      this.state.score += 1;
      this.increaseSpeed();
      this.placeFood();
    } else {
      this.state.snake.pop();
    }

    this.emit();
  }

   /*  ======================
      Helpers
      ======================  */
  
  private resetState() {
    const center = Math.floor(this.GRID_SIZE / 2) * this.GRID_SIZE + 2;
    this.state = {
      ...this.state,
      direction: Direction.Right,
      snake: [center, center - 1],
      food: this.randomCell(),
      score: 0,
      speed: this.BASE_SPEED,
      highScore: this.getHighScore()
    };
  }

  private increaseSpeed() {
    if (this.state.speed > 120) {
      this.state.speed -= 20;
      this.startLoop();
    }
  }

  private placeFood() {
    let cell;
    do {
      cell = this.randomCell();
    } while (this.state.snake.includes(cell))
    this.state.food = cell;
  }

  private randomCell(): number {
    return Math.floor(Math.random() * (this.GRID_SIZE ** 2));
  }

  private emit() {
    this.snapshotSubject.next({ ...this.state });
  }

  /*  ======================
      High Score Management
      ======================  */
  
  getHighScore(): number {
    return Number(localStorage.getItem(this.HIGH_SCORE_KEY)) || 0;
  }

  setHighScore(currentScore: number): void {
    const savedHighScore = this.getHighScore();
    if (currentScore > savedHighScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, currentScore.toString());
    }
  }

}
