import {
  InjectionToken,
  ModuleWithProviders,
  NgModule,
  Provider,
} from '@angular/core';
import { NgxScrollAnimationsDirective } from './ngx-scroll-animations.directive';
import { NgxScrollAnimationConfigs } from './utils/ngx-scroll-animation-configs';

export const NGX_SCROLL_ANIMATION_CONFIGS =
  new InjectionToken<NgxScrollAnimationConfigs>('NgxScrollAnimationConfigs');

@NgModule({
  imports: [NgxScrollAnimationsDirective],
  exports: [NgxScrollAnimationsDirective],
})
export class NgxScrollAnimationsModule {
  static forRoot(
    configs: NgxScrollAnimationConfigs
  ): ModuleWithProviders<NgxScrollAnimationsModule> {
    return {
      ngModule: NgxScrollAnimationsModule,
      providers: [provideNgxScrollAnimations(configs)],
    };
  }
}

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
