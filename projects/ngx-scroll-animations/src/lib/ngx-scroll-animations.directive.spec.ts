import { ElementRef, NgZone, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxScrollAnimationsDirective } from './ngx-scroll-animations.directive';
import { NgxScrollAnimationsService } from './ngx-scroll-animations.service';

describe('NgxScrollAnimationsDirective', () => {
  let directive: NgxScrollAnimationsDirective;
  let elementRef: ElementRef;
  let renderer2: Renderer2;
  let ngZone: NgZone;
  let ngxScrollAnimationsService: NgxScrollAnimationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NgxScrollAnimationsDirective],
      providers: [
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
        { provide: Renderer2, useValue: jasmine.createSpyObj('Renderer2', ['setStyle', 'removeStyle']) },
        { provide: NgxScrollAnimationsService, useValue: jasmine.createSpyObj('NgxScrollAnimationsService', ['trigger']) },
        NgZone // Mock other dependencies if necessary
      ]
    });

    directive = TestBed.inject(NgxScrollAnimationsDirective);
    elementRef = TestBed.inject(ElementRef);
    renderer2 = TestBed.inject(Renderer2);
    ngZone = TestBed.inject(NgZone);
    ngxScrollAnimationsService = TestBed.inject(NgxScrollAnimationsService);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  // Test for input properties
  describe('Input properties', () => {
    it('should set speed', () => {
      directive.speed = 'fast';
      expect(directive.speed).toBe('400ms');
    });

    // Additional tests for other input properties...
  });

  // Test for output events
  describe('Output events', () => {
    it('should emit startAnimation event', () => {
      spyOn(directive.startAnimation, 'emit');
      directive['triggerAnimation']();
      expect(directive.startAnimation.emit).toHaveBeenCalled();
    });

    // Additional tests for doneAnimation event...
  });

  // Test DOM manipulations
  describe('DOM manipulations', () => {
    it('should set styles when triggerAnimation is called', () => {
      directive['triggerAnimation']();
      expect(renderer2.setStyle).toHaveBeenCalled();
    });
  });
});
