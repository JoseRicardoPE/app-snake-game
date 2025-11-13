import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-board',
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {

  gridSize: number = 10;
  cells: number[] = [];
  snake: number[] = [];
  food = 0;

  ngOnInit(): void {
    this.initBoard();
    this.placeInitialSnake();
    this.placeFood();
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
