import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Directive, ElementRef, EventEmitter, Inject, Input, NgZone, OnInit, Output, PLATFORM_ID, Renderer2, booleanAttribute, inject, numberAttribute } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, filter, fromEvent, takeWhile } from 'rxjs';
import { NgxScrollAnimationsService } from './ngx-scroll-animations.service';
import { ThresholdModeT } from './utils/ngx-scroll-animations-types';



@Directive({
    selector: '[ngxScrollAnimate]',
    standalone: true,
})
export class NgxScrollAnimationsDirective implements OnInit {
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
    public get speed(): string { return this._speed; }
    private _speed = '300ms';

    /**
     * Delays the start of the animation. Accepts the delay time in milliseconds.
     * @param delayTime - The time in milliseconds to delay the start of the animation.
     */
    @Input({ transform: numberAttribute })
    set delay(delayTime: number) {
        const value = delayTime;
        if (value) {
            this._delay = `${value}ms`;
        } else {
            this._delay = delayTime ? `${delayTime}ms` : '';
        }
    }
    public get delay(): string { return this._delay; }
    private _delay: string = '';


    /**
     * A boolean value to enable or disable the animation.
     */
    @Input({ transform: booleanAttribute })
    disabled = false;

    /**
     * Defines how the animation accelerates and decelerates during its runtime.
     * Acceptable values: 'ease', 'ease-in', 'ease-out', 'ease-in-out', or a 'cubic-bezier()' function call.
     */
    @Input()
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string = 'ease'

    /**
     * The threshold for triggering the animation when an element scrolls into the viewport.
     * The default is 80% for 'percent' mode and 20 for 'pixel' mode if not specified.
     */
    @Input()
    public set aos(value: number | string | undefined) {
        this.threshold = value ? +value : (this.thresholdMode === 'percent' ? .8 : 20);
    }

    /**
     * Defines the mode for calculating the threshold: 'percent' or 'pixel'.
     */
    @Input()
    set thresholdMode(mode: ThresholdModeT | undefined) {
        this._thresholdMode = mode ?? 'percent';
    }
    public get thresholdMode(): ThresholdModeT { return this._thresholdMode; }
    private _thresholdMode: ThresholdModeT = 'percent';

    /**
     * If true, triggers the animation only once when the element scrolls into the viewport.
     */
    @Input({ transform: booleanAttribute })
    public once = true;

    /**
     * When set to true, replays the animation. Useful for re-triggering animations.
     */
    @Input({ transform: booleanAttribute })
    public set replay(replay: boolean) {
        // Re-triggers the animation again on request (skipping the very fist value)
        if (replay) {
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
    public get animate(): string { return this._animate; }
    private _animate: string = 'fade-in-up';

    /** Subject to manage replaying of the animation */
    private replay$ = new Subject<boolean>();

    /** Flag to indicate if the animation is currently running */
    public animating = false;

    /** Threshold of the animation */
    private threshold = 0.8;

    private count = 0;
    private lastViewState?: number;

    // Dependency injections
    private renderer = inject(Renderer2);
    private zone = inject(NgZone);
    private destroyRef = inject(DestroyRef);
    private elRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private scrollService = inject(NgxScrollAnimationsService);

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
    ) { }

    /**
     * Initializes the directive and sets up the animation triggers.
     */
    ngOnInit(): void {
        this.zone.runOutsideAngular(() => {
            this.triggerIdle();
            if (isPlatformBrowser(this.platformId)) {
                this.listenAnimationState();
                this.setupAnimationTrigger();
            }
        });
    }


    /**
     * Sets up listeners for animation start and end events.
     */
    private listenAnimationState(): void {
        fromEvent(this.elRef.nativeElement, 'animationstart').pipe(
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(() => {
            this.animating = true;
            this.startAnimation.emit();
        });

        fromEvent(this.elRef.nativeElement, 'animationend').pipe(
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(() => {
            this.animating = false;
            this.endAnimation.emit();
            this.clearAnimation(this.once || this.lastViewState === 1);
        });
    }

    /**
     * Configures the RxJS stream for triggering animations.
     */
    private setupAnimationTrigger(): void {
        this.replay$.pipe(
            this.scrollService.trigger(this.elRef, this.threshold, this.thresholdMode),
            filter((val) => (!this.animating || this.lastViewState === 0) && (this.lastViewState !== val || (this.once && this.lastViewState !== 1))),
            takeWhile(trigger => !trigger || !this.once, true),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe({
            next: (trigger) => {
                this.lastViewState = trigger;
                trigger ?
                    this.triggerAnimation('normal') :
                    !this.once && this.count > 0 ?
                        this.triggerAnimation('reverse') :
                        this.triggerIdle()
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
            this.count++;
            this.clearAnimation(true);
            this.triggerIdle();
            this.renderer.setStyle(
                this.elRef.nativeElement,
                'animation',
                `${this.animate} ${this.speed} ${this.delay ? this.delay + ' ' : ''}${this.easing} ${direction}`
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
}
