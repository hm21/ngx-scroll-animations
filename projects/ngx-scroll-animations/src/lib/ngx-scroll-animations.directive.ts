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
  Optional,
  Output,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  of,
  startWith,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  timer,
} from 'rxjs';
import { NGX_SCROLL_ANIMATION_CONFIGS } from './ngx-scroll-animations.provider';
import { NgxScrollAnimationsService } from './ngx-scroll-animations.service';
import {
  BooleanInput,
  coerceBooleanProperty,
} from './utils/coercion/coercion-boolean';
import {
  NumberInput,
  coerceNumberProperty,
} from './utils/coercion/coercion-number';
import { NgxScrollAnimationConfigs } from './utils/ngx-scroll-animation-configs';
import { ThresholdModeT } from './utils/ngx-scroll-animations-types';

@Directive({
  standalone: true,
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
   * The speed at which the animation runs in milliseconds.
   * @param speed - The desired speed of the animation, chosen from predefined options.
   * @default 300
   */
  @Input()
  public set speed(speed: NumberInput) {
    this._speed = `${coerceNumberProperty(speed, 300)}ms`;
  }
  public get speed(): string {
    return this._speed;
  }
  private _speed = '300ms';

  /**
   * Delays the start of the animation. Accepts the delay time in milliseconds.
   * @param delayTime - The time in milliseconds to delay the start of the animation.
   * @default 0
   */
  @Input()
  set delay(delayTime: NumberInput) {
    const value = coerceNumberProperty(delayTime);
    this._delay = !!value ? `${value}ms` : delayTime?.toString() ?? '';
  }
  public get delay(): string {
    return this._delay;
  }
  private _delay: string = '';

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
  private _disabled: boolean = false;

  /**
   * Defines how the animation accelerates and decelerates during its runtime.
   *
   * Example values: `ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier()`
   *
   * @default `ease`
   */
  @Input()
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string = 'ease';

  /**
   * The threshold for triggering the animation when an element scrolls into the viewport.
   *
   * The default is `80%` for `percent` mode and `20` for `pixel` mode if not specified.
   */
  @Input()
  public set aos(value: NumberInput) {
    if (!!value && typeof value !== 'number' && isNaN(+value)) {
      throw new Error('`aos` must be a number');
    }
    this.threshold = coerceNumberProperty(
      value,
      this.thresholdMode === 'percent' ? 0.8 : 20
    );
  }

  /**
   * Defines the mode for calculating the threshold: `percent` or `pixel`.
   *
   * @default `percent`
   */
  @Input()
  set thresholdMode(mode: ThresholdModeT | undefined) {
    this._thresholdMode = mode ?? 'percent';
  }
  public get thresholdMode(): ThresholdModeT {
    return this._thresholdMode;
  }
  private _thresholdMode: ThresholdModeT = 'percent';

  /**
   * If `true`, triggers the animation only once when the element scrolls into the viewport.
   *
   * @default true
   */
  @Input()
  set once(value: BooleanInput) {
    this._once = coerceBooleanProperty(value);
  }
  get once(): boolean {
    return this._once;
  }
  private _once: boolean = true;

  /**
   * Set this property to `false` if your application runs with ng zone.
   *
   * @default true
   */
  @Input()
  set zoneless(value: BooleanInput) {
    this._zoneless = coerceBooleanProperty(value);
  }
  get zoneless(): boolean {
    return this._zoneless;
  }
  private _zoneless: boolean = true;

  /**
   * The gap between the animation start point and the animation end point.
   * This prevents the animation from starting/stopping improperly,
   * which often happens on mobile devices.
   *
   * @default 20
   */
  @Input()
  set undoGap(value: NumberInput) {
    this._undoGap = coerceNumberProperty(value);
  }
  get undoGap(): number {
    return this._undoGap;
  }
  private _undoGap: number = 20;

  /**
   * Specifies the animation to be played.
   *
   * @default
   * 'fade-in-up'
   */
  @Input('ngxScrollAnimate')
  set animationName(val: string | undefined) {
    if (val) this._animate = val;
  }
  public get animationName(): string {
    return this._animate;
  }
  private _animate: string = 'fade-in-up';

  /** Indicates how many time the animation is active triggered on the current element */
  public activeAnimations = 0;

  /** Total count how many time the animation is triggered */
  public count = 0;

  public lastViewState?: VisibleState;

  /** Threshold of the animation */
  private threshold = 0.8;

  private temporaryBoundings!: DOMRect;
  private onStable = new EventEmitter<any>();
  private destroy$ = new Subject();

  constructor(
    private renderer: Renderer2,
    private zone: NgZone,
    private elRef: ElementRef<HTMLElement>,
    private scrollService: NgxScrollAnimationsService,
    @Optional()
    @Inject(NGX_SCROLL_ANIMATION_CONFIGS)
    configs: NgxScrollAnimationConfigs | undefined,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    if (configs) {
      if (configs.speed !== undefined) {
        this.speed = configs.speed;
      }
      if (configs.delay !== undefined) {
        this.delay = configs.delay;
      }
      if (configs.disabled !== undefined) {
        this.disabled = configs.disabled;
      }
      if (configs.easing !== undefined) {
        this.easing = configs.easing;
      }
      if (configs.threshold !== undefined) {
        this.aos = configs.threshold;
      }
      if (configs.thresholdMode !== undefined) {
        this.thresholdMode = configs.thresholdMode;
      }
      if (configs.once !== undefined) {
        this.once = configs.once;
      }
      if (configs.zoneless !== undefined) {
        this.zoneless = configs.zoneless;
      }
      if (configs.undoGap !== undefined) {
        this.undoGap = configs.undoGap;
      }
      if (configs.animationName !== undefined) {
        this.animationName = configs.animationName;
      }
    }
  }

  /**
   * Initializes the directive and sets up the animation triggers.
   */
  ngOnInit(): void {
    this.setTemporaryBoundings();
    this.elRef.nativeElement.classList.add('ngx-scroll-animations');

    if (this.zoneless) {
      this.initListeners();
    } else {
      this.onStable = this.zone.onStable;
      this.zone.runOutsideAngular(() => {
        this.initListeners();
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.zoneless) {
      timer(1).subscribe(() => {
        this.onStable.next(true);
      });
    }
    this.setTemporaryBoundings();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private initListeners() {
    this.triggerIdle();
    if (isPlatformBrowser(this.platformId)) {
      this.listenAnimationState();
      this.setupAnimationTrigger();
    }
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
        // Make sure the animation is not triggered by a child element.
        filter((event) => event.target === this.elRef.nativeElement),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.startAnimation.emit();
      });

    fromEvent(this.elRef.nativeElement, 'animationend')
      .pipe(
        // Make sure the animation is not triggered by a child element.
        filter((event) => event.target === this.elRef.nativeElement),
        tap(() => {
          this.endAnimation.emit();
          this.clearAnimation(this.once || this.lastViewState === 'visible');
        }),
        debounceTime(10),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.activeAnimations--;
      });
  }

  /**
   * Configures the RxJS stream for triggering animations.
   */
  private setupAnimationTrigger(): void {
    this.onStable
      .pipe(
        // Check element is visible
        switchMap(() => this.checkVisibility()),
        // Ignore same states
        distinctUntilChanged(),
        // Do nothing when the position is `hold`
        filter((val) => val !== 'hold'),
        // If the animation run only once we can stop after the element is visible
        takeWhile((trigger) => trigger !== 'visible' || !this.once, true),
        // Update the lastViewState
        tap((trigger) => (this.lastViewState = trigger)),
        // Check in which direction the animation should run
        map((trigger) => {
          if (trigger === 'visible') {
            return 'normal';
          } else if (this.count > 0) {
            return 'reverse';
          }
          return undefined;
        }),
        // Destroy the animation listener
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (direction) => {
          if (direction) {
            this.triggerAnimation(direction);
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
        `${this.animationName} ${this.speed} ${
          this.delay ? this.delay + ' ' : ''
        }${this.easing} ${direction}`
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
  private checkVisibility(): Observable<VisibleState> {
    if (this.threshold <= 0) return of('visible');

    return this.scrollService.scroll$.pipe(
      startWith(0),
      switchMap(() =>
        this.scrollService.view$!.pipe(
          map((view) => {
            let rect!: DOMRect;
            if (this.activeAnimations > 0) {
              rect = this.temporaryBoundings;
            } else {
              rect = this.elRef.nativeElement.getBoundingClientRect();
              this.temporaryBoundings = rect;
            }

            const triggerPos =
              this.thresholdMode === 'percent'
                ? rect.height * this.threshold
                : this.threshold;

            const currentPos = rect.top - view.height + triggerPos;
            if (currentPos <= 0) {
              return 'visible';
            } else if (currentPos > this.undoGap) {
              return 'hidden';
            } else {
              return 'hold';
            }
          })
        )
      )
    );
  }
}

type VisibleState = 'visible' | 'hidden' | 'hold';
