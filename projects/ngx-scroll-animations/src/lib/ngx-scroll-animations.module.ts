import { NgModule } from '@angular/core';
import { NgxScrollAnimationsDirective } from './ngx-scroll-animations.directive';
import { NgxScrollAnimationsService } from './ngx-scroll-animations.service';


@NgModule({
    imports: [],
    exports: [NgxScrollAnimationsDirective],
    declarations: [NgxScrollAnimationsDirective],
    providers: [NgxScrollAnimationsService],
})
export class NgxScrollAnimationsModule { }
