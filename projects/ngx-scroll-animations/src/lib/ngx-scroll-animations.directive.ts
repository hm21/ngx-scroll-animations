import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { Observable, Subject, fromEvent, of } from 'rxjs';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  first,
  map,
  startWith,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs/operators';
import { NgxScrollAnimationsService } from './ngx-scroll-animations.service';
import {
  BooleanInput,
  coerceBooleanProperty,
} from './utils/coercion/coercion-boolean';
import {
  NumberInput,
  coerceNumberProperty,
} from './utils/coercion/coercion-number';
import { ThresholdModeT } from './utils/ngx-scroll-animations-types';

@Directive({
  selector: '[ngxScrollAnimate]',
})
export class NgxScrollAnimationsDirective
  implements OnInit, AfterViewInit, OnDestroy
{
  /**
   * Emits an event at the start of the animation.
   */
  @Output() startAnimation = new EventEmitter<void>();

  /**
   * Emits an event at the end of the animation.
   */
  @Output() endAnimation = new EventEmitter<void>();

  /**
   * Defines the available speed options for the animation.
   */

  /**
   * The speed at which the animation runs in milliseconds.
   * @param speed - The desired speed of the animation, chosen from predefined options.
   */
  @Input()
  public set speed(speed: number | string | undefined) {
    this._speed = `${+(speed ?? 300)}ms`;
  }
  public get speed(): string {
    return this._speed;
  }
  private _speed = '300ms';

  /**
   * Delays the start of the animation. Accepts the delay time in milliseconds.
   * @param delayTime - The time in milliseconds to delay the start of the animation.
   */
  @Input()
  set delay(delayTime: NumberInput) {
    const value = coerceNumberProperty(delayTime);
    if (value) {
      this._delay = `${value}ms`;
    } else {
      this._delay = delayTime ? `${delayTime}ms` : '';
    }
  }
  public get delay(): string {
    return this._delay;
  }
  private _delay: string = '';

  private _disabled: boolean = false;
  /**
   * A boolean value to enable or disable the animation.
   */
  @Input()
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  get disabled(): boolean {
    return this._disabled;
  }

  /**
   * Defines how the animation accelerates and decelerates during its runtime.
   * Acceptable values: 'ease', 'ease-in', 'ease-out', 'ease-in-out', or a 'cubic-bezier()' function call.
   */
  @Input()
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string = 'ease';

  /**
   * The threshold for triggering the animation when an element scrolls into the viewport.
   * The default is 80% for 'percent' mode and 20 for 'pixel' mode if not specified.
   */
  @Input()
  public set aos(value: number | string | undefined) {
    this.threshold = value
      ? +value
      : this.thresholdMode === 'percent'
        ? 0.8
        : 20;
  }

  /**
   * Defines the mode for calculating the threshold: 'percent' or 'pixel'.
   */
  @Input()
  set thresholdMode(mode: ThresholdModeT | undefined) {
    this._thresholdMode = mode ?? 'percent';
  }
  public get thresholdMode(): ThresholdModeT {
    return this._thresholdMode;
  }
  private _thresholdMode: ThresholdModeT = 'percent';

  private _once: boolean = true;
  /**
   * If true, triggers the animation only once when the element scrolls into the viewport.
   */
  @Input()
  set once(value: BooleanInput) {
    this._once = coerceBooleanProperty(value);
  }
  get once(): boolean {
    return this._once;
  }

  private _zoneless: boolean = true;
  /**
   * Set this property to false if your application runs with ng zone.
   */
  @Input()
  set zoneless(value: BooleanInput) {
    this._zoneless = coerceBooleanProperty(value);
  }
  get zoneless(): boolean {
    return this._zoneless;
  }

  private _undoGap: number = 20;
  /**
   * The gap between the animation start point and animation leave point.
   * @default 20
   */
  @Input()
  set undoGap(value: NumberInput) {
    this._undoGap = coerceNumberProperty(value);
  }
  get undoGap(): number {
    return this._undoGap;
  }

  /**
   * When set to true, replays the animation. Useful for re-triggering animations.
   */
  @Input()
  public set replay(replay: BooleanInput) {
    // Re-triggers the animation again on request (skipping the very fist value)
    if (coerceBooleanProperty(replay)) {
      this.triggerIdle();
      this.replay$.next(true);
    }
  }

  /**
   * Specifies the animation to be played.
   */
  @Input('ngxScrollAnimate')
  set animate(val: string | undefined) {
    if (val) {
      this._animate = val;
    }
  }
  public get animate(): string {
    return this._animate;
  }
  private _animate: string = 'fade-in-up';

  /** Subject to manage replaying of the animation */
  private replay$ = new Subject<boolean>();

  /** Flag to indicate if the animation is currently running */
  public activeAnimations = 0;

  /** Threshold of the animation */
  private threshold = 0.8;

  private count = 0;
  private lastViewState?: number;

  private onStable = new EventEmitter<any>();
  private temporaryBoundings!: DOMRect;
  private destroy$ = new Subject();

  constructor(
    private renderer: Renderer2,
    private zone: NgZone,
    private elRef: ElementRef<HTMLElement>,
    private scrollService: NgxScrollAnimationsService,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {}

  /**
   * Initializes the directive and sets up the animation triggers.
   */
  ngOnInit(): void {
    if (!this.zoneless) this.onStable = this.zone.onStable;

    this.setTemporaryBoundings();
    this.elRef.nativeElement.classList.add('ngx-scroll-animations');
    this.zone.runOutsideAngular(() => {
      this.triggerIdle();
      if (isPlatformBrowser(this.platformId)) {
        this.listenAnimationState();
        this.setupAnimationTrigger();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.zoneless) this.onStable.next(true);
    this.setTemporaryBoundings();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private setTemporaryBoundings() {
    if (isPlatformBrowser(this.platformId)) {
      this.temporaryBoundings =
        this.elRef.nativeElement.getBoundingClientRect();
    }
  }

  /**
   * Sets up listeners for animation start and end events.
   */
  private listenAnimationState(): void {
    fromEvent(this.elRef.nativeElement, 'animationstart')
      .pipe(
        takeUntil(this.destroy$),
        // Make sure the animation is not triggered by a child element.
        filter((event) => event.target === this.elRef.nativeElement),
      )
      .subscribe(() => {
        this.startAnimation.emit();
      });

    fromEvent(this.elRef.nativeElement, 'animationend')
      .pipe(
        takeUntil(this.destroy$),
        // Make sure the animation is not triggered by a child element.
        filter((event) => event.target === this.elRef.nativeElement),
        tap(() => {
          this.endAnimation.emit();
          this.clearAnimation(this.once || this.lastViewState === 1);
        }),
        debounceTime(10),
      )
      .subscribe(() => {
        this.activeAnimations--;
      });
  }

  /**
   * Configures the RxJS stream for triggering animations.
   */
  private setupAnimationTrigger(): void {
    this.replay$
      .pipe(
        () =>
          this.onStable.pipe(
            first(),
            delay(1), // Delay is important in zoneless applications
            switchMap((trigger) =>
              this.threshold > 0
                ? this.scrollService.scroll$!.pipe(
                    startWith(0),
                    switchMap(() =>
                      this.checkVisibility(
                        this.elRef.nativeElement,
                        this.threshold,
                        this.thresholdMode,
                        this.undoGap,
                      ),
                    ),
                  )
                : of(trigger),
            ),
          ),
        distinctUntilChanged(),
        filter(
          (val) =>
            val !== undefined &&
            (this.activeAnimations === 0 || this.lastViewState === 0) &&
            (this.lastViewState !== val ||
              (this.once && this.lastViewState !== 1)),
        ),
        takeWhile((trigger) => !trigger || !this.once, true),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (trigger) => {
          this.lastViewState = trigger;

          if (trigger) {
            this.triggerAnimation('normal');
          } else if (!this.once && this.count > 0) {
            this.triggerAnimation('reverse');
          } else {
            this.triggerIdle();
          }
        },
        error: (err) => {
          console.error(err);
          this.triggerAnimation('normal');
        },
      });
  }

  /**
   * Applies the specified animation styles to the element.
   * This method sets the animation CSS property on the element
   * based on the configured animation type, speed, delay, and easing.
   * It only applies the styles if the animation is not disabled.
   */
  private triggerAnimation(direction: 'normal' | 'reverse') {
    if (!this.disabled) {
      this.activeAnimations++;
      this.count++;
      this.clearAnimation(true);
      this.triggerIdle();
      this.renderer.setStyle(
        this.elRef.nativeElement,
        'animation',
        `${this.animate} ${this.speed} ${this.delay ? this.delay + ' ' : ''}${
          this.easing
        } ${direction}`,
      );
    }
  }

  /**
   * Sets the element's opacity to zero.
   * This method is used to make the element invisible before the animation starts.
   * It only sets the opacity if the animation is not disabled.
   */
  private triggerIdle() {
    if (!this.disabled) {
      this.renderer.setStyle(this.elRef.nativeElement, 'opacity', 0);
    }
  }

  /**
   * Clears the animation and opacity styles from the element.
   * This method removes the CSS animation and opacity properties,
   * effectively resetting the element to its initial state.
   */
  private clearAnimation(clearAll: boolean) {
    this.renderer.removeStyle(this.elRef.nativeElement, 'animation');
    if (clearAll) {
      this.renderer.removeStyle(this.elRef.nativeElement, 'opacity');
    }
  }

  /**
   * Calculates the visibility of the element within the viewport, based on the given threshold.
   * @param element - The ElementRef of the HTML element to check.
   * @param threshold - The threshold value for visibility.
   * @param thresholdMode - The mode ('percent' or 'pixel') for calculating the threshold.
   * @param undoGap - The gap between the animation start point and animation leave point.
   * @returns An Observable emitting the visibility state (0, 1, or undefined).
   */
  private checkVisibility(
    element: HTMLElement,
    threshold: number,
    thresholdMode: ThresholdModeT,
    undoGap: number,
  ): Observable<0 | 1 | undefined> {
    return this.scrollService.view$!.pipe(
      map((view) => {
        let rect!: DOMRect;
        if (this.activeAnimations > 0) {
          rect = this.temporaryBoundings;
        } else {
          rect = element.getBoundingClientRect();
          this.temporaryBoundings = rect;
        }

        const triggerPos =
          thresholdMode === 'percent' ? rect.height * threshold : threshold;

        const currentPos = rect.top - view.height + triggerPos;
        return currentPos <= 0 ? 1 : currentPos > undoGap ? 0 : undefined;
      }),
    );
  }
}
