import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxScrollAnimationsDirective, ThresholdModeT } from 'ngx-scroll-animations';

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
      thresholdMode: 'percent',
    },
    {
      title: 'Delay 1000ms',
      delay: 1_000,
      thresholdMode: 'percent',
      duration: 500,
    },
    {
      title: 'Easing options',
      duration: 1_000,
      thresholdMode: 'percent',
      threshold: 0.8,
      timingFunction: [
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
      differentDuration: true,
      duration: 500,
      threshold: 0.7,
      thresholdMode: 'percent',
    },
    {
      title: 'Multiple animate',
      duration: 500,
      thresholdMode: 'percent',
      threshold: 0.7,
      triggerBuffer: 50,
      once: false,
    },
    {
      title: 'Custom animations',
      duration: 1_200,
      thresholdMode: 'percent',
      threshold: 1,
      once: false,
      animationType: [
        'fade-in-right',
        'fade-in',
        'fade-in-up-scale',
        'fade-in-up-scale',
        'fade-in-left',
      ],
    },
  ];

  public items = new Array(5);
}

interface ItemI {
  title: string;
  differentDuration?: boolean;
  disabled?: boolean;
  once?: boolean;
  thresholdMode: ThresholdModeT;
  threshold?: number;
  duration?: number;
  delay?: number;
  triggerBuffer?: number;
  timingFunction?: string[];
  animationType?: string[];
}
