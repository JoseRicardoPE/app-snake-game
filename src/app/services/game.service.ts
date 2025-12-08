import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly HIGH_SCORE_KEY = 'snake_game_high_score';

  constructor() { }
  
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
