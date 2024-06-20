import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import {
  debounceTime,
  map,
  share,
  shareReplay,
  startWith,
  throttleTime
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NgxScrollAnimationsService {
  public view$!: Observable<DOMRect>;
  public scroll$!: Observable<Event>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Observable for viewport changes, using window resize events as a trigger
      this.view$ = fromEvent(window, 'resize').pipe(
        debounceTime(100),
        startWith(this.getCurrentViewport()),
        map(() => this.getCurrentViewport()),
        shareReplay(1),
      );

      // Observable for scroll events on the window
      this.scroll$ = fromEvent(this.document, 'scroll').pipe(
        throttleTime(50, undefined, { leading: true, trailing: true }),
        share(),
      );
    }
  }

  /**
   * Overrides the default scroll listener for the specified HTML element.
   *
   * @param {HTMLElement} element - The HTML element for which to override the scroll listener.
   * @returns {void}
   */
  public overrideScrollListener(element: HTMLElement): void {
    this.scroll$ = fromEvent(element, 'scroll').pipe(
      throttleTime(50, undefined, { leading: true, trailing: true }),
      share(),
    );
  }

  /**
   * Retrieves the current viewport rectangle.
   * @returns The DOMRect representing the current viewport dimensions.
   */
  public getCurrentViewport(): DOMRect {
    return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  }
}
