import {
  InjectionToken,
  Provider
} from '@angular/core';
import { NgxScrollAnimationConfigs } from '../interfaces/ngx-scroll-animation-config.interface';

export const NGX_SCROLL_ANIMATION_CONFIGS =
  new InjectionToken<NgxScrollAnimationConfigs>('NgxScrollAnimationConfigs');

export function provideNgxScrollAnimations(
  configs?: NgxScrollAnimationConfigs
): Provider {
  return [
    {
      provide: NGX_SCROLL_ANIMATION_CONFIGS,
      useValue: configs,
    },
  ];
}
