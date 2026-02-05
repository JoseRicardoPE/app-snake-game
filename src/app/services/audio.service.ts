import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private audioContext!: AudioContext;
  private unlocked: boolean = false;
  private musicInterval: any = null;
  private muted = false;
  private musicEnabled = false;
  private tempo = 280;

  constructor() {
    const stored = localStorage.getItem('sound-muted');
    this.muted = stored === 'true';
  }

  // Mute or unmute all sounds
  isMuted(): boolean {
    return this.muted;
  }

  setMuted(value: boolean): void {
    this.muted = value;
    localStorage.setItem('sound-muted', String(this.muted));

    if (this.muted) {
      this.pauseMusic();
    } else if (this.musicEnabled) {
      this.resumeMusic();
    }
  }

  unlock(): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.unlocked = true;
    console.log('Audio unlocked');
  }

  setMusicLevel(level: number): void {
    this.tempo = Math.max(180, 280 - level * 10);
    if (this.musicInterval) {
      this.stopMusic();
      this.startMusicLoop();
    }
  }

  // Core function to play a tone
  private playTone(frequency: number, duration: number, volume: number) {
    if (!this.unlocked || this.muted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }
  
  // GameBoy music loop
  startMusicLoop(): void {
    if (this.muted || !this.unlocked || this.musicInterval) return; 

    const notes = [
      523, 659, 784, 659,   // C5 E5 G5 E5
      523, 659, 784, 880,   // C5 E5 G5 A5
      784, 659, 523, 0,     // G5 E5 C5 (silencio)
    ];

    let index = 0;

    this.musicInterval = setInterval(() => {
      const note = notes[index];
      if (note > 0) {
        this.playTone(note, 140, 0.05);
      }
      index = (index + 1) % notes.length;
    }, this.tempo);
  }

  startMusic(level: number = 1): void {
    if (this.musicInterval) return;
    this.tempo = Math.max(180, 280 - level * 10);
    this.musicEnabled = true;
    this.startMusicLoop();
  }

  stopMusic(): void {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  pauseMusic(): void {
    // if (this.muted) return;
    this.stopMusic();
  }

  resumeMusic(level: number = 1): void {
    if (this.muted || !this.unlocked || this.musicInterval) return;
    
    if (this.musicEnabled) {
      this.startMusic(level);
    }

  }

  // Simple beep sound for effects
  // Sound for eating food
  eat() {
    if (this.muted) return;
    this.playTone(880, 80, 0.12);
  }

  // Sound for hitting wall or self
  hit(): void {
    if (this.muted) return;
    this.playTone(220, 200, 0.2);
  }

  // Sound for game over
  gameOver(): void {
    this.playTone(440, 200, 0.2);
    setTimeout(() => this.playTone(330, 200, 0.2), 200);
    setTimeout(() => this.playTone(220, 400, 0.2), 400);
  }

  // Sound for pausing the game
  pause(): void {
    if (this.muted) return;
    this.playTone(600, 80, 0.1);
  }

  // Sound for resuming the game
  resume(): void {
    if (this.muted) return;
    this.playTone(900, 80, 0.1);
  }

}
