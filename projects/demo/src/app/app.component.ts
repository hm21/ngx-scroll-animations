import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  NgxScrollAnimationsDirective,
  ThresholdModeT,
} from 'ngx-scroll-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [NgxScrollAnimationsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  public examples: ItemI[] = [
    {
      title: 'Disable animations',
      disabled: true,
    },
    {
      title: 'Delay 1000ms',
      delay: 1_000,
      speed: 500,
    },
    {
      title: 'Easing options',
      speed: 1_000,
      threshold: 0.8,
      easing: [
        'ease',
        'ease-out',
        'ease-in',
        'ease-in-out',
        'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      ],
    },
    {
      title: 'Threshold 20px',
      threshold: 20,
      thresholdMode: 'pixel',
    },
    {
      title: 'Threshold 60%',
      threshold: 0.6,
      thresholdMode: 'percent',
    },
    {
      title: 'Different speed',
      differentSpeed: true,
      speed: 500,
      threshold: 0.7,
      thresholdMode: 'percent',
    },
    {
      title: 'Multiple animate',
      speed: 500,
      threshold: 0.7,
      undoGap: 50,
      once: false,
    },
    {
      title: 'Custom animations',
      speed: 1_200,
      threshold: 1,
      once: false,
      animationType: [
        'fade-in-right',
        'fade-in',
        'slide-in-up',
        'fade-in-up-scale',
        'fade-in-left',
      ],
    },
  ];

  public items = new Array(5);
}

interface ItemI {
  title: string;
  differentSpeed?: boolean;
  disabled?: boolean;
  once?: boolean;
  thresholdMode?: ThresholdModeT;
  threshold?: number;
  speed?: number;
  delay?: number;
  undoGap?: number;
  easing?: string[];
  animationType?: string[];
}
