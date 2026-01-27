import { TestBed } from '@angular/core/testing';

import { GameEffectsService } from './game-effects.service';

describe('GameEffectsService', () => {
  let service: GameEffectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameEffectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
