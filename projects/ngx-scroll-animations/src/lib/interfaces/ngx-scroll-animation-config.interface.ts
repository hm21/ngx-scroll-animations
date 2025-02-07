import { ThresholdModeT } from '../types/ngx-scroll-animations.types';

export interface NgxScrollAnimationConfigs {
  /**
   * @deprecated Use `duration` instead.
   * TODO: Remove deprecated
   */
  speed?: number;
  /**
   * The duration of the animation in milliseconds.
   * @param duration - The desired duration of the animation.
   * @default 300
   */
  duration?: number;
  /**
   * The duration of the animation in milliseconds.
   * @param duration - The desired duration of the animation.
   * @default 300
   */
  reverseDuration?: number;

  /**
   * Delays the start of the animation. Accepts the delay time in milliseconds.
   * @param delayTime - The time in milliseconds to delay the start of the animation.
   * @default 0
   */
  delay?: number;

  /**
   * A boolean value to enable or disable the animation.
   */
  disabled?: boolean;

  /**
   * @deprecated Use `timingFunction` instead.
   * TODO: Remove deprecated
   */
  easing?: string;
  /**
   * Defines how the animation accelerates and decelerates during its runtime.
   *
   * Example values: `ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier()`
   *
   * @default `ease`
   */
  timingFunction?: string;

  /**
   * The threshold for triggering the animation when an element scrolls into the viewport.
   *
   * The default is `80%` for `percent` mode and `20` for `pixel` mode if not specified.
   */
  threshold?: number;
  
  /**
   * Defines the mode for calculating the threshold: `percent` or `pixel`.
   *
   * @default `percent`
   */
  thresholdMode?: ThresholdModeT;

  /**
   * If `true`, triggers the animation only once when the element scrolls into the viewport.
   *
   * @default true
   */
  once?: boolean;

  /**
   * @deprecated Use `triggerBuffer` instead.
   * TODO: Remove deprecated
   *
   * @default 20
   */
  undoGap?: number;
  /**
   * The buffer between the animation start point and the animation end point.
   * This prevents the animation from starting/stopping improperly,
   * which often happens on mobile devices.
   *
   * @default 20
   */
  triggerBuffer?: number;

  /**
   * Specifies the animation to be played.
   *
   * @default
   * 'fade-in-up'
   */
  animationName?: string;
}
