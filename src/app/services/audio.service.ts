import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private audioContext!: AudioContext;
  private unlocked: boolean = false;
  private musicOscillator!: OscillatorNode;
  private musicGainNode!: GainNode;
  private musicInterval: any = null;
  private muted = false;

  constructor() {
    const stored = localStorage.getItem('sound-muted');
    this.muted = stored === 'true';
  }

  // Mute or unmute all sounds
  isMuted(): boolean {
    return this.muted;
  }

  // Toggle mute state
  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('sound-muted', String(this.muted));

    if (this.muted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  unlock() {
    if (this.unlocked) return; 

    this.audioContext = new AudioContext();
    this.audioContext.resume();
    this.unlocked = true;
    console.log('Audio unlocked');
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
  startMusic(level: number = 1) {

    if (this.muted) return; 

    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    this.musicGainNode = this.audioContext.createGain();
    this.musicGainNode.gain.value = 0.05; // Low volume for background music

    this.musicGainNode.connect(this.audioContext.destination)

    if (!this.unlocked || this.musicInterval) return;

    const notes = [
      523, 659, 784, 659,   // C5 E5 G5 E5
      523, 659, 784, 880,   // C5 E5 G5 A5
      784, 659, 523, 0,     // G5 E5 C5 (silencio)
    ];

    const tempo = Math.max(180, 280 - level * 10); // Increase speed with level

    let index = 0;

    this.musicInterval = setInterval(() => {
      const note = notes[index];
      if (note > 0) {
        this.playTone(note, 140, 0.05);
      }
      index = (index + 1) % notes.length;
    }, tempo);
  }

  isMusicPlaying(): boolean {
    return this.musicInterval !== null;
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  pauseMusic() {
    if (this.muted) return;
    this.stopMusic();
  }

  resumeMusic() {
    if (this.muted) return;
    this.startMusic();
  }

  // Simple beep sound for effects
  // Sound for eating food
  eat() {
    if (this.muted) return;
    this.playTone(880, 80, 0.12);
  }

  // Sound for hitting wall or self
  hit() {
    if (this.muted) return;
    this.playTone(220, 200, 0.2);
  }

  // Sound for game over
  gameOver() {
    this.playTone(440, 200, 0.2);
    setTimeout(() => this.playTone(330, 200, 0.2), 200);
    setTimeout(() => this.playTone(220, 400, 0.2), 400);
  }

  // Sound for pausing the game
  pause() {
    if (this.muted) return;
    this.playTone(600, 80, 0.1);
  }

  // Sound for resuming the game
  resume() {
    if (this.muted) return;
    this.playTone(900, 80, 0.1);
  }

}
