import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameEffectsService {

  constructor() { }

  vibrate(pattern: number[] = [400, 120, 400]): void { 
    if ('vibrate' in navigator && window.matchMedia('(pointer: coarse)').matches) {
      navigator.vibrate(pattern);
    }
  }
}
