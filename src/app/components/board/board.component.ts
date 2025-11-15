import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Direction } from './enum/direction';

@Component({
  selector: 'app-board',
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {

  direction: Direction = Direction.Right;

  gridSize: number = 10;
  cells: number[] = [];
  snake: number[] = [];
  food = 0;


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

  private handleKeyEvent = (event: KeyboardEvent) => {
    this.handleDirection(event.key);
  }

  startGameLoop() {
    setInterval(() => {
      this.moveSnake();
    }, 1000);
  }

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

    // ? Check collisions with walls
    if (newHeadIndex < 0 || newHeadIndex >= totalCells) {
      return this.gameOver();
    }

    // ? Check collisions with self
    if (this.snake.includes(newHeadIndex)) {
      return this.gameOver();
    }
    
    // ? Add new head
    this.snake.unshift(newHeadIndex);

    // ? eat new food
    if (newHeadIndex === this.food) {
      this.placeFood();
    } else {
      this.snake.pop();
    }

    this.updateBoard();
  }

  updateBoard() {}

  gameOver() {
    alert("GAME OVER 🐍💥");
    this.ngOnInit(); // reiniciar la partida
  }

  private initBoard() {
    const total = this.gridSize * this.gridSize;
    this.cells = Array.from({ length: total }, (_, i) => i);

    const board = document.querySelector('app-board .board') as HTMLElement | null;
    if (board) {
      board.style.gridTemplateColumns = `repeat(${this.gridSize}, auto)`;
    }
  }

  private placeInitialSnake() {
    const centerRow = Math.floor(this.gridSize / 2);
    const centerCol = Math.floor(this.gridSize / 2);
    const headIndex = centerRow * this.gridSize + centerCol + 2;
    this.snake = [headIndex, headIndex - 1, headIndex -2];
  }

  private placeFood() {
    this.food = this.randomEmptyCell();
  }

  private randomEmptyCell(): number {
    const total = this.gridSize * this.gridSize;
    let idx = Math.floor(Math.random() * total);
    while (this.snake.includes(idx)) {
      idx = Math.floor(Math.random() * total);
    }
    return idx;
  }

  // Helpers usados por el template
  isFoodCell(index: number): boolean {
    return this.food === index;
  }
  isSnakeCell(index: number): boolean {
    return this.snake.includes(index);
  }
  isSnakeHead(index: number): boolean {
    return this.snake.length > 0 && index === this.snake[0];
  }
  isSnakeTail(index: number): boolean {
    return this.snake.length > 0 && index === this.snake[this.snake.length - 1];
  }
  
}
