import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Direction } from './enum/direction';
import { GameService } from '../../services/game.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-board',
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {

  @Input() isPaused: boolean = false;
  @Input() externalDirection: string | null = null;
  @Output() livesChange = new EventEmitter<number>();
  @Output() scoreChange = new EventEmitter<number>();

  private readonly BASE_SPEED: number = 600;

  Direction = Direction;
  direction: Direction = Direction.Right;
  gridSize: number = 10;
  cells: number[] = [];
  snake: number[] = [];
  food = 0;
  gameInterval: any;
  lives: number = 1;
  score: number = 0;
  snake_speed: number = 600;
  level_speed: number = 1;
  allowVibration: boolean = false;
  isGameOver: boolean = false;
    
  constructor(
    public gameService: GameService,
    private audioService: AudioService,
  ) {}

  ngOnInit(): void {
    this.initBoard();
    this.placeInitialSnake();
    this.placeFood();
    window.addEventListener('keydown', this.handleKeyEvent);
    this.startGameLoop();
    this.audioService.startMusic(this.difficulty);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.handleKeyEvent);
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes['externalDirection'] && this.externalDirection) {
      this.handleDirection(this.externalDirection);
    }
    
    if (changes['isPaused']) {
      if (this.isPaused) {
        this.audioService.pauseMusic();
        this.audioService.pause();
        console.log('En pause');
      } else {
        this.audioService.resumeMusic();
        this.audioService.resume();
        console.log('Reanudado');
      }
    }

    if (changes['externalDirection'] && this.externalDirection) {
      this.handleDirection(this.externalDirection);
    }
    
  }

  // Unlock audio on first user interaction
  @HostListener('window:touchstart')
  @HostListener('window:keydown')
  unlockAudio() {
    this.audioService.unlock();
  }

  // Key event listener
  private handleKeyEvent = (event: KeyboardEvent) => {
    this.handleDirection(event.key);
  }

  // Start the main game loop
  startGameLoop() {
    if (this.gameInterval) return;

    this.gameInterval = setInterval(() => {
      if (!this.isPaused || this.isGameOver) return; {
        this.moveSnake();
      }
    }, this.snake_speed);
  }

  // Helper vibrate function
  private vibrate() {
    
    if (this.allowVibration &&  'vibrate' in navigator && window.matchMedia('(pointer: coarse)').matches) {
      requestAnimationFrame(() => {
        navigator.vibrate([400, 120, 400]);
      })
    }
    
  }

  // Move the snake based on the current direction
  moveSnake() {
    const headIndex = this.snake[0];
    let newHeadIndex = headIndex;

    const totalCells = this.gridSize * this.gridSize;
    const col = headIndex % this.gridSize;
    

    switch (this.direction) {
      case Direction.Up: 
        newHeadIndex = headIndex - this.gridSize;
        break;
      case Direction.Down:
        newHeadIndex += this.gridSize;
        break;
      case Direction.Left:
        if (col === 0) {
          this.vibrate();
          this.gameOver();
          return;
        } 
        newHeadIndex -= 1;
        break;
      case Direction.Right:
        if (col === this.gridSize - 1) {
          this.vibrate();
          this.gameOver();
          return;
        }
        newHeadIndex += 1;
        break;
    }

    // Check collisions with walls
    if (newHeadIndex < 0 || newHeadIndex >= totalCells) {
      this.vibrate();
      this.audioService.hit();
      this.gameOver();
      return;
    }
    
    // Check collisions with self
    if (this.snake.includes(newHeadIndex)) {
      this.vibrate();
      this.audioService.hit();
      this.gameOver();
      return;
    }
    
    // Add new head
    this.snake.unshift(newHeadIndex);
    
    // eat new food
    if (newHeadIndex === this.food) {

      this.audioService.eat();
      
      const bonus = this.difficulty;

      // Increment score for each successful move
      this.score += bonus;
      this.scoreChange.emit(this.score);
      
      this.increaseSpeed();
      this.placeFood();
    } else {
      this.snake.pop();
    }

    this.updateBoard();
  }

  // Handle direction changes based on key input
  private handleDirection(key: string) {
    if (key === 'ArrowUp' && this.direction !== Direction.Down) {
      this.direction = Direction.Up;
    } else if (key === 'ArrowDown' && this.direction !== Direction.Up) {
      this.direction = Direction.Down;
    } else if (key === 'ArrowLeft' && this.direction !== Direction.Right) {
      this.direction = Direction.Left;
    } else if (key === 'ArrowRight' && this.direction !== Direction.Left) {
      this.direction = Direction.Right;
    }
  }

  get getColorSnake(): string {
    switch (this.difficulty) {
      case 1: return 'snake-level-1';
      case 2: return 'snake-level-2';
      case 3: return 'snake-level-3';
      case 4: return 'snake-level-4';
      case 5: return 'snake-level-5';
      default: return 'snake-level-6';
    }
  }

  // Calculate current difficulty level based on snake speeed
  get difficulty(): number {
    return Math.max(1, Math.floor(this.BASE_SPEED / this.snake_speed));
  }

  // Increase snake speed as the game progresses
  increaseSpeed() {
    if (this.snake_speed > 120) {
      this.snake_speed -= 20;
      this.restartGameLoop();

      // speed music
      this.audioService.stopMusic();
      this.audioService.startMusic(this.difficulty);
    }
  }

  // Restart the game loop with the updated speed
  restartGameLoop() {
    clearInterval(this.gameInterval);
    this.gameInterval = null;
    this.startGameLoop();
  }

  updateBoard() {}

  // Reset the entire game
  resetGame() {
    this.isGameOver = false;
    this.audioService.startMusic(this.difficulty);

    this.lives = 1;
    this.livesChange.emit(this.lives);

    this.score = 0;
    this.scoreChange.emit(this.score);

    this.level_speed = 1;
    this.snake_speed = 600;

    clearInterval(this.gameInterval);
    this.gameInterval = null;
    
    this.direction = Direction.Right;
    this.snake = [];
    this.initBoard();
    this.placeInitialSnake();
    this.placeFood();

    this.startGameLoop();
  }

  // Reset the snake and food after a collision but without restarting the whole game
  private resetAfterCollisionSnake() {
    const head = this.snake[0];

    this.direction = Direction.Right;
    
    const length = this.snake.length;

    this.snake = Array.from({ length }, (_, i) => head - i);

    this.placeFood();
  }

  // Handle game over scenario and life management
  gameOver() {
    if (this.isGameOver) return;

    this.isGameOver = true;

    clearInterval(this.gameInterval);
    this.gameInterval = null;

    this.gameService.setHighScore(this.score);
    
    this.audioService.stopMusic();
    this.audioService.gameOver();
    
    this.vibrate();
  }

  restartFromGameOver() {
    this.isGameOver = false;

    this.lives = 1;
    this.score = 0;

    this.livesChange.emit(this.lives);
    this.scoreChange.emit(this.score);

    this.snake_speed = this.BASE_SPEED;
    this.direction = Direction.Right;

    this.initBoard();
    this.placeInitialSnake();
    this.placeFood();

    this.audioService.startMusic(this.difficulty);
    this.startGameLoop();
  }

  // Initialize the board grid
  private initBoard() {
    const total = this.gridSize * this.gridSize;
    this.cells = Array.from({ length: total }, (_, i) => i);

    const board = document.querySelector('app-board .board') as HTMLElement | null;
    if (board) {
      board.style.gridTemplateColumns = `repeat(${this.gridSize}, auto)`;
    }
  }

  // Place the initial snake in the center of the board
  private placeInitialSnake() {
    const centerRow = Math.floor(this.gridSize / 2);
    const centerCol = Math.floor(this.gridSize / 2);
    const headIndex = centerRow * this.gridSize + centerCol + 2;

    // Snake init with two segments
    this.snake = [headIndex, headIndex - 1];
  }

  // Place food in a random empty cell
  private placeFood() {
    this.food = this.randomEmptyCell();
  }

  // Get a random empty cell index
  private randomEmptyCell(): number {
    const total = this.gridSize * this.gridSize;
    let idx = Math.floor(Math.random() * total);
    while (this.snake.includes(idx)) {
      idx = Math.floor(Math.random() * total);
    }
    return idx;
  }

  // Helpers to identify cell types
  // Determine if a cell is part of the snake's head, tail, body, or food
  isSnakeHead(index: number): boolean {
    return this.snake.length > 0 && index === this.snake[0];
  }
  isSnakeTail(index: number): boolean {
    return this.snake.length > 0 && index === this.snake[this.snake.length - 1];
  }
  isSnakeCell(index: number): boolean {
    return this.snake.includes(index);
  }
  isFoodCell(index: number): boolean {
    return this.food === index;
  }
  
}
