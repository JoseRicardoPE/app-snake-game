import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private audioContext!: AudioContext;
  private unlocked: boolean = false; 

  unlock() {
    if (this.unlocked) return; 

    this.audioContext = new AudioContext();

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.unlocked = true;
    console.log('Audio unlocked');
  }

  private beep(freq: number, duration: number, type: OscillatorType = 'square') {
    if (!this.unlocked) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = freq;

    gainNode.gain.value = 0.15;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration / 1000);

    oscillator.stop(this.audioContext.currentTime + duration / 1000);

  }
  
  // Sound for eating food
  eat() {
    this.beep(880, 80, 'triangle');
  }

  // Sound for hitting wall or self
  hit() {
    this.beep(220, 200, 'square');
  }

  // Sound for game over
  gameOver() {
    this.beep(440, 200, 'triangle');
    setTimeout(() => this.beep(330, 200, 'triangle'), 200);
    setTimeout(() => this.beep(220, 400, 'triangle'), 400);
  }

  // Sound for pausing the game
  pause() {
    this.beep(600, 80, 'square');
  }

  // Sound for resuming the game
  resume() {
    this.beep(900, 80, 'square');
  }

}
