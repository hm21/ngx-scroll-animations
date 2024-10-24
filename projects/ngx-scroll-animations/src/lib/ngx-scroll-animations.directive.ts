import {
  afterNextRender,
  AfterViewInit,
  booleanAttribute,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
import { NgxScrollAnimationsService } from './ngx-scroll-animations.service';
import { NGX_SCROLL_ANIMATION_CONFIGS } from './provider/ngx-scroll-animations.provider';
import {
  IS_BROWSER,
  providePlatformDetection,
} from './provider/platform.provider';
import { ThresholdModeT } from './utils/ngx-scroll-animations-types';

@Directive({
  standalone: true,
  selector: '[ngxScrollAnimate]',
  providers: [providePlatformDetection()],
})
export class NgxScrollAnimationsDirective
  implements OnInit, AfterViewInit, OnDestroy
{
  private isBrowser = inject(IS_BROWSER);
  private destroyRef = inject(DestroyRef);
  private scrollService = inject(NgxScrollAnimationsService);
  private elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private configs = inject(NGX_SCROLL_ANIMATION_CONFIGS, { optional: true });

  /**
   * Emits an event at the start of the animation.
   */
  public startAnimation = output();
  /**
   * Emits an event at the end of the animation.
   */
  public endAnimation = output();

  /**
   * The speed at which the animation runs in milliseconds.
   * @param speed - The desired speed of the animation, chosen from predefined options.
   * @default 300
   */
  public speed = input(`${this.configs?.speed ?? 300}ms`, {
    transform: (value) => {
      return `${numberAttribute(value, 300)}ms`;
    },
  });
  /**
   * Delays the start of the animation. Accepts the delay time in milliseconds.
   * @param delayTime - The time in milliseconds to delay the start of the animation.
   * @default 0
   */
  public delay = input(this.configs?.delay?.toString() ?? '', {
    transform: (value) => {
      const val = numberAttribute(value);
      return !!val ? `${val}ms` : value?.toString() ?? '';
    },
  });
  /**
   * A boolean value to enable or disable the animation.
   */
  public disabled = input(this.configs?.disabled ?? false, {
    transform: booleanAttribute,
  });

  /**
   * Defines how the animation accelerates and decelerates during its runtime.
   *
   * Example values: `ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier()`
   *
   * @default `ease`
   */
  public easing = input<string>(this.configs?.easing ?? 'ease');

  /**
   * Defines the mode for calculating the threshold: `percent` or `pixel`.
   *
   * @default `percent`
   */
  public thresholdMode = input<ThresholdModeT>(
    this.configs?.thresholdMode ?? 'percent'
  );

  /**
   * The threshold for triggering the animation when an element scrolls into the viewport.
   *
   * The default is `80%` for `percent` mode and `20` for `pixel` mode if not specified.
   */
  public threshold = input(
    this.configs?.threshold ?? (this.thresholdMode() === 'percent' ? 0.8 : 20),
    {
      alias: 'aos',
      transform: (value) => {
        if (!!value && typeof value !== 'number' && isNaN(+value)) {
          throw new Error('`aos` must be a number');
        }

        return numberAttribute(
          value,
          this.thresholdMode() === 'percent' ? 0.8 : 20
        );
      },
    }
  );

  /**
   * If `true`, triggers the animation only once when the element scrolls into the viewport.
   *
   * @default true
   */
  public once = input(this.configs?.once ?? true);

  /**
   * The gap between the animation start point and the animation end point.
   * This prevents the animation from starting/stopping improperly,
   * which often happens on mobile devices.
   *
   * @default 20
   */
  public undoGap = input(this.configs?.undoGap ?? 20, {
    transform: (value) => numberAttribute(value, 20),
  });

  /**
   * Specifies the animation to be played.
   *
   * @default
   * 'fade-in-up'
   */
  public animationType = input(this.configs?.animationName ?? 'fade-in-up', {
    alias: 'ngxScrollAnimate',
    transform: (value) => {
      return value || 'fade-in-up';
    },
  });

  /** Indicates how many time the animation is active triggered on the current element */
  public activeAnimations = 0;

  /** Total count how many time the animation is triggered */
  public count = 0;

  public lastViewState?: VisibleState;

  private temporaryBounding!: DOMRect;

  private onStable = new Subject<void>();

  constructor() {
    afterNextRender(() => {
      this.onStable.next();
    });
  }

  ngOnInit(): void {
    this.setTemporaryBounding();
    this.elRef.nativeElement.classList.add('ngx-scroll-animations');

    this.initListeners();
  }

  ngAfterViewInit(): void {
    this.setTemporaryBounding();
  }

  ngOnDestroy(): void {
    this.onStable.complete();
  }

  private initListeners() {
    this.triggerIdle();
    if (this.isBrowser) {
      this.listenAnimationState();
      this.setupAnimationTrigger();
    }
  }

  private setTemporaryBounding() {
    if (this.isBrowser) {
      this.temporaryBounding = this.elRef.nativeElement.getBoundingClientRect();
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
        takeUntilDestroyed(this.destroyRef)
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
          this.clearAnimation(this.once() || this.lastViewState === 'visible');
        }),
        debounceTime(10),
        takeUntilDestroyed(this.destroyRef)
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
        takeWhile((trigger) => trigger !== 'visible' || !this.once(), true),
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
        takeUntilDestroyed(this.destroyRef)
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
    if (!this.disabled()) {
      this.activeAnimations++;
      this.count++;
      this.clearAnimation(true);
      this.triggerIdle();
      this.elRef.nativeElement.style.animation = `${this.animationType()} ${this.speed()} ${
        this.delay() ? this.delay() + ' ' : ''
      }${this.easing()} ${direction}`;
    }
  }

  /**
   * Sets the element's opacity to zero.
   * This method is used to make the element invisible before the animation starts.
   * It only sets the opacity if the animation is not disabled.
   */
  private triggerIdle() {
    if (!this.disabled()) {
      this.elRef.nativeElement.style.opacity = '0';
    }
  }

  /**
   * Clears the animation and opacity styles from the element.
   * This method removes the CSS animation and opacity properties,
   * effectively resetting the element to its initial state.
   */
  private clearAnimation(clearAll: boolean) {
    this.elRef.nativeElement.style.removeProperty('animation');
    if (clearAll) {
      this.elRef.nativeElement.style.removeProperty('opacity');
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
    if (this.threshold() <= 0) return of('visible');

    return this.scrollService.scroll$.pipe(
      startWith(0),
      switchMap(() =>
        this.scrollService.view$!.pipe(
          map((view) => {
            let rect!: DOMRect;
            if (this.activeAnimations > 0) {
              rect = this.temporaryBounding;
            } else {
              rect = this.elRef.nativeElement.getBoundingClientRect();
              this.temporaryBounding = rect;
            }

            const triggerPos =
              this.thresholdMode() === 'percent'
                ? rect.height * this.threshold()
                : this.threshold();

            const currentPos = rect.top - view.height + triggerPos;
            if (currentPos <= 0) {
              return 'visible';
            } else if (currentPos > this.undoGap()) {
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
