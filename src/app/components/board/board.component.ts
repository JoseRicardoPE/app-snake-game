import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Direction } from './enum/direction';

@Component({
  selector: 'app-board',
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {

  Direction = Direction;
  direction: Direction = Direction.Right;
  gridSize: number = 10;
  cells: number[] = [];
  snake: number[] = [];
  food = 0;
  gameInterval: any;
  lives: number = 3;
  score: number = 0;
  
  @Input() isPaused: boolean = false;
  @Input() externalDirection: string | null = null;
  @Output() livesChange = new EventEmitter<number>();
  @Output() scoreChange = new EventEmitter<number>();

  ngOnInit(): void {
    this.initBoard();
    this.placeInitialSnake();
    this.placeFood();
    window.addEventListener('keydown', this.handleKeyEvent);
    this.startGameLoop();
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
        console.log('En pause');
      } else {
        console.log('Reanudado');
      }
    }
    
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

  // Key event listener
  private handleKeyEvent = (event: KeyboardEvent) => {
    this.handleDirection(event.key);
  }

  // Start the main game loop
  startGameLoop() {
    if (this.gameInterval) return;

    this.gameInterval = setInterval(() => {
      if (!this.isPaused) {
        this.moveSnake();
      }
    }, 1000);
  }

  // Move the snake based on the current direction
  moveSnake() {
    const headIndex = this.snake[0];
    let newHeadIndex = headIndex;

    const totalCells = this.gridSize * this.gridSize;
    const row = Math.floor(headIndex / this.gridSize);
    const col = headIndex % this.gridSize;
    

    switch (this.direction) {
      case Direction.Up:
        newHeadIndex = headIndex - this.gridSize;
        break;
      case Direction.Down:
        newHeadIndex = headIndex + this.gridSize;
        break;
      case Direction.Left:
        if (col === 0) return this.gameOver(); 
        newHeadIndex = headIndex - 1;
        break;
      case Direction.Right:
        if (col === this.gridSize - 1) return this.gameOver();
        newHeadIndex = headIndex + 1;
        break;
    }

    // Increment score for each successful move
    if (newHeadIndex === this.food) {
      this.score++;
      this.scoreChange.emit(this.score);
    }
    // Check collisions with walls
    if (newHeadIndex < 0 || newHeadIndex >= totalCells) {
      return this.gameOver();
    }

    // Check collisions with self
    if (this.snake.includes(newHeadIndex)) {
      return this.gameOver();
    }
    
    // Add new head
    this.snake.unshift(newHeadIndex);

    // eat new food
    if (newHeadIndex === this.food) {
      this.placeFood();
    } else {
      this.snake.pop();
    }

    this.updateBoard();
  }

  updateBoard() {}

  // Reset the entire game
  resetGame() {
    this.lives = 3;
    this.livesChange.emit(this.lives);
    this.score = 0;
    this.scoreChange.emit(this.score);
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
    this.direction = Direction.Right;
    this.placeInitialSnake();
    this.placeFood();
  }

  // Handle game over scenario and life management
  gameOver() {
    if (this.lives <= 1) {
      alert("GAME OVER 🐍💥");
      this.resetGame();
    } else {
      this.lives--;
      this.livesChange.emit(this.lives);
      this.resetAfterCollisionSnake();
    }  
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
    this.snake = [headIndex, headIndex - 1, headIndex -2];
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
