import {
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import { NgxScrollAnimationsDirective } from './ngx-scroll-animations.directive';
import { provideNgxScrollAnimations } from './ngx-scroll-animations.provider';
import { NgxScrollAnimationConfigs } from './utils/ngx-scroll-animation-configs';

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
