import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  debounceTime,
  fromEvent,
  map,
  Observable,
  share,
  shareReplay,
  startWith,
  throttleTime
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NgxScrollAnimationsService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  public view$!: Observable<DOMRect>;
  public scroll$!: Observable<Event>;

  constructor() {
    // Observable for viewport changes, using window resize events as a trigger
    if (isPlatformBrowser(this.platformId)) {
      this.view$ = fromEvent(window, 'resize').pipe(
        debounceTime(100),
        startWith(this.getCurrentViewport()),
        map(this.getCurrentViewport),
        // Share the last screen size
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }

    // Observable for scroll events on the window
    this.scroll$ = fromEvent(this.document, 'scroll').pipe(
      throttleTime(50, undefined, { leading: true, trailing: true }),
      share()
    );
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
      share()
    );
  }
  /**
   * Overrides the default resize listener for the specified HTML element.
   *
   * @param {HTMLElement} element - The HTML element for which to override the resize listener.
   * @returns {void}
   */
  public overrideResizeListener(element: HTMLElement): void {
    this.view$ = fromEvent(element, 'resize').pipe(
      debounceTime(100),
      startWith(this.getCurrentViewport()),
      map(this.getCurrentViewport),
      // Share the last screen size
      shareReplay(1)
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
