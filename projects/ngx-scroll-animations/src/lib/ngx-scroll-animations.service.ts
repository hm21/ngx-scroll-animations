import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ElementRef, Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { Observable, OperatorFunction, debounceTime, first, fromEvent, map, of, share, shareReplay, startWith, switchMap, throttleTime } from 'rxjs';
import { ThresholdModeT } from './utils/ngx-scroll-animations-types';

@Injectable({
  providedIn: 'root'
})
export class NgxScrollAnimationsService {
  private view$!: Observable<DOMRect>;
  private scroll$!: Observable<Event>;

  constructor(
    private zone: NgZone,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Observable for viewport changes, using window resize events as a trigger
      this.view$ = fromEvent(this.document, 'resize').pipe(
        debounceTime(100),
        startWith(this.getCurrentViewport()),
        map(() => this.getCurrentViewport()),
        shareReplay(1)
      );

      // Observable for scroll events on the window
      this.scroll$ = fromEvent(this.document, 'scroll').pipe(
        throttleTime(50, undefined, { leading: true, trailing: true }),
        share(),
      );
    }
  }

  /**
   * Retrieves the current viewport rectangle.
   * @returns The DOMRect representing the current viewport dimensions.
   */
  public getCurrentViewport(): DOMRect {
    return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  }

  /**
   * Triggers the animation for a given HTML element based on the specified threshold.
   * @param elm - The ElementRef of the HTML element to animate.
   * @param threshold - The threshold value to trigger the animation.
   * @param thresholdMode - The mode ('percent' or 'pixel') for calculating the threshold.
   * @returns An OperatorFunction that can be used to animate the element.
   */
  public trigger(elm: ElementRef<HTMLElement>, threshold: number, thresholdMode: ThresholdModeT): OperatorFunction<boolean, 0 | 1 | undefined> {
    return source => this.zone.onStable.pipe(
      first(),
      // switchMap(() => source),
      switchMap((trigger) => threshold > 0 ?
        this.animateOnScroll(elm, threshold, thresholdMode) :
        of(trigger)),
    );
  }

  /**
   * Manages the animation logic of an element based on scroll events.
   * @param elm - The ElementRef of the HTML element to animate.
   * @param threshold - The threshold value to trigger the animation.
   * @param thresholdMode - The mode ('percent' or 'pixel') for calculating the threshold.
   * @returns An Observable<boolean> indicating whether the animation should be triggered.
   */
  private animateOnScroll(elm: ElementRef<HTMLElement>, threshold: number, thresholdMode: ThresholdModeT): Observable<0 | 1 | undefined> {
    return this.scroll$!.pipe(
      startWith(0),
      switchMap(() => this.checkVisibility(elm, threshold, thresholdMode)),
      //  distinctUntilChanged(),
    );
  }

  /**
   * Calculates the visibility of the element within the viewport, based on the given threshold.
   * @param elm - The ElementRef of the HTML element to check.
   * @param threshold - The threshold value for visibility.
   * @param thresholdMode - The mode ('percent' or 'pixel') for calculating the threshold.
   * @returns An Observable emitting the visibility state (0, 1, or undefined).
   */
  private checkVisibility(elm: ElementRef<HTMLElement>, threshold: number, thresholdMode: ThresholdModeT): Observable<0 | 1 | undefined> {
    return this.view$!.pipe(
      map(view => {
        const rect = elm.nativeElement.getBoundingClientRect();
        const triggerPos = thresholdMode === 'percent' ? rect.height * threshold : threshold;
        return rect.top - view.height + triggerPos <= 0 && rect.bottom >= 0 ? 1 : 0;
      })
    );
  }
}
