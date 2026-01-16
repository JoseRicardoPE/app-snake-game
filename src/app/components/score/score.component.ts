import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameSnapshot } from '../../services/models/game-snapshot';
import { GameService } from '../../services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score',
  imports: [CommonModule],
  templateUrl: './score.component.html',
  styleUrl: './score.component.scss'
})
export class ScoreComponent implements OnInit, OnDestroy {
  private sub!: Subscription;
  snapshot!: GameSnapshot;

  constructor(
    private gameService: GameService,
  ) {}
  
  ngOnInit() {
    this.sub = this.gameService.snapshot$.subscribe(s => {
      this.snapshot = s;
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
