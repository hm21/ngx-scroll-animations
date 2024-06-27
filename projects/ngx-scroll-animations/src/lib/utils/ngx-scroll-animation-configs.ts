import { ThresholdModeT } from './ngx-scroll-animations-types';

export interface NgxScrollAnimationConfigs {
  /**
   * The speed at which the animation runs in milliseconds.
   * @param speed - The desired speed of the animation, chosen from predefined options.
   * @default 300
   */
  speed?: number;
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
   * Defines how the animation accelerates and decelerates during its runtime.
   *
   * Example values: `ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier()`
   *
   * @default `ease`
   */
  easing?: string;
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
   * Set this property to `false` if your application runs with ng zone.
   *
   * @default true
   */
  zoneless?: boolean;
  /**
   * The gap between the animation start point and the animation end point.
   * This prevents the animation from starting/stopping improperly,
   * which often happens on mobile devices.
   *
   * @default 20
   */
  undoGap?: number;
  /**
   * Specifies the animation to be played.
   *
   * @default
   * 'fade-in-up'
   */
  animationName?: string;
}
