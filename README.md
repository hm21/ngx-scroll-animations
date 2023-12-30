<h1>angular 9+ scroll-animations</h1>

<div>

[![npm version](https://badge.fury.io/js/ngx-scroll-animations.svg)](https://badge.fury.io/js/ngx-scroll-animations)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

<h2 >Demo</h2>
<div>
https://ngx-hm21.web.app/scroll-animations
</div>

## Table of contents

- [About](#about)
- [Getting started](#getting-started)
- [Documentation](#documentation)
- [Example](#example)
- [Contributing](#contributing)
- [License](LICENSE)

<br/>

<h2>About</h2>

This minimalistic Angular directive, free from external dependencies, empowers you to effortlessly implement CSS animations on elements. These animations trigger when an element comes into view through scrolling on the page. It seamlessly integrates with your choice of CSS animations.

<br/>
<h2>Getting started</h2>

### Installation

```sh
npm install ngx-scroll-animations
```

#### Optionally include prebuilt animations
```css
/* angular-cli file: src/styles.css */
@import "node_modules/ngx-scroll-animations/styles/animations.min.css";
```

### Using the directive

#### Standalone component
```typescript
import { Component } from '@angular/core';
import { NgxScrollAnimationsModule } from 'ngx-scroll-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [ NgxScrollAnimationsModule ],
})
export class AppComponent {}
```

#### Or for Module
```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { NgxScrollAnimationsModule } from 'ngx-scroll-animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxScrollAnimationsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

<br/>

<h2>Documentation</h2>

### Inputs

| Option            | Type            | Default           | Comment                                                  |
|:------------------|:----------------|:------------------|:--------------------------------------------------------|
| ngxScrollAnimate  | string           | fade-in-up       | Name of the animation (as example 'fade-in')          |
| easing            | string           | ease             | Defines how the animation accelerates and decelerates during its runtime. |
| speed             | number           | 300              | The speed at which the animation runs in milliseconds.                 |
| delay             | number           | 0                | Delays the start of the animation. Accepts the delay time in milliseconds. |
| aos               | number           | 0.8 (when thresholdMode is set to 'pixel', the value is 20) | The threshold for triggering the animation when an element scrolls into the viewport. |
| thresholdMode     | 'percent' / 'pixel' | percent         | Defines the mode for calculating the threshold: 'percent' or 'pixel'. |
| once              | boolean          | true             | If true, triggers the animation only once when the element scrolls into the viewport. |
| disabled          | boolean          | false            | A boolean value to enable or disable the animation.    |


### Outputs
| Option          | Type               | Comment                                       |
|:----------------|:-------------------|:----------------------------------------------|
| startAnimation  | EventEmitter<void> | Emits an event at the start of the animation. |
| endAnimation    | EventEmitter<void> | Emits an event at the end of the animation.   |

### Prebuild animations
- `'fade-in'`
- `'fade-in-right'`
- `'fade-in-left'`
- `'fade-in-up'`
- `'fade-in-up-scale'`
- `'fade-in-down'`
- `'slide-in-up'`
- `'scale-in'`
- `'bounce'`
- `'rotate'`

<br/>

<h2>Example</h2>

#### Simple example
```html
<img
  ngxScrollAnimate
  src="https://picsum.photos/300"
  alt="demo-image"
/>
```

<br/>

#### Complete example demonstrating all properties
```html
<img
  ngxScrollAnimate="fade-in-up"
  easing="ease"
  speed="300"
  delay="0"
  aos="0.8"
  thresholdMode="percent"
  once="true"
  disabled="false"
  (endAnimation)="endAnimation()"
  (startAnimation)="startAnimation()"
  src="https://picsum.photos/300"
  alt="demo-image"
/>
```
<br/>

#### Custom animation
```css
@keyframes my-special-animation {
    from {
        opacity: 0;
        background: red;
    }
    to {
        opacity: 1;
        background: blue;
    }
}
```

```html
<img
  ngxScrollAnimate="my-special-animation"
  src="https://picsum.photos/300"
  speed="2000"
  alt="demo-image"
/>
```

<br/>

## Contributing

I welcome contributions from the open-source community to make this project even better. Whether you want to report a bug, suggest a new feature, or contribute code, I appreciate your help.

### Bug Reports and Feature Requests

If you encounter a bug or have an idea for a new feature, please open an issue on my [GitHub Issues](https://github.com/hm21/ngx-scroll-animations/issues) page. I will review it and discuss the best approach to address it.

### Code Contributions

If you'd like to contribute code to this project, please follow these steps:

1. Fork the repository to your GitHub account.
2. Clone your forked repository to your local machine.

```bash
git clone https://github.com/hm21/ngx-scroll-animations.git
```
