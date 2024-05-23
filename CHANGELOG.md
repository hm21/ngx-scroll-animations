# Changelog

All notable changes to this project will be documented in this file.

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

### Added

- Enhance the functionality by implementing a feature that allows users to override the scroll listener to a different HTML element.

## `1.0.6` - 2023-12-20

### Added

- Added backward compatibility for Angular 9.

### Fixed

- Fixed minor bugs and issues.

### Updated

- Updated dependencies to the latest versions.

## `1.0.0` (2023-12-18)

_Initial release_

---