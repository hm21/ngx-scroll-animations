# Changelog

All notable changes to this project will be documented in this file.

## `3.2.0` - 2025.02.07

### Feat

- Added new parameter `reverseDuration` for controlling the reverse animation duration.

### Fix

- Fixed an issue where the animation trigger misbehaved when sliding in while scrolling up/down.

### Chore

- Marked `speed` as deprecated and replaced it with `duration`.
- Marked `easing` as deprecated and replaced it with `timingFunction`.
- Marked `undoGap` as deprecated and replaced it with `triggerBuffer`.

## `3.1.1` - 2025.01.30

### Fix

- Resolve trigger issue with scaling animations.

## `3.0.2` - 2024.10.28

### Feat

- Add `booleanAttribute` to the `once` input

## `3.0.1` - 2024.10.24

### DOC

- Update the README file to reflect the latest changes.

## `3.0.0` - 2024.10.24

### Breaking Changes

- **Angular Version**: Minimum supported version is now Angular 18.
- **Removed**: `zone.js` has been completely removed.

### Other Updates

- General code optimizations and improvements for better performance.

## `2.0.1` - 2024.06.27

### Fix

- Ensure unit tests work with standalone solution

## `2.0.0` - 2024.06.27

### Feat

- Convert to a complete standalone solution for better support with Angular 18.
- Added ability to set global configs.

## `1.2.2` - 2024.06.20

### Fix

- Resolved issue where scrolling did not retrigger when a child element started an animation.
- Resolved issue where scrolling was triggered multiple times and at wrong positions when the user used a scale animation.

## `1.2.1` - 2024.03.22

### Fix

- Resolve issue where scroll is not triggering on initialization in zoneless applications

## `1.2.0` - 2024.05.23

### Feat

- Added support for Angular 18 zone-less applications.
- Replaced this.zone.onStable with an EventEmitter to ensure compatibility with zone-less environments.
- This update ensures that the application functions seamlessly in Angular 18 without relying on Angular Zones.

## `1.1.3` - 2024.03.22

### Feat

- Add a gap for multiple scroll animations so that they are not triggered twice at the same moment.

## `1.1.2` - 2024.03.07

### Fix

- Resize screen was not triggered

## `1.1.1` - 2024.02.16

### Fix

- Export scroll-service that user can override the scroll-listener

## `1.1.0` - 2024.02.16

### Feat

- Enhance the functionality by implementing a feature that allows users to override the scroll listener to a different HTML element.

## `1.0.6` - 2023-12-20

### Feat

- Added backward compatibility for Angular 9.

### Fix

- Fixed minor bugs and issues.

### Chore

- Updated dependencies to the latest versions.

## `1.0.0` (2023-12-18)

_Initial release_

---
