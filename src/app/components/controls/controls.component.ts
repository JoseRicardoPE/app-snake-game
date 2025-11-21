import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-controls',
  imports: [CommonModule],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.scss'
})
export class ControlsComponent {

  @Output() direction = new EventEmitter<string>();
  @Output() pauseClicked = new EventEmitter<void>();

  @Input() isPaused: boolean = false;

  emitDirection(dir: string) {
    this.direction.emit(dir);
  }

  emitPause() {
    this.pauseClicked.emit();
  }

}
