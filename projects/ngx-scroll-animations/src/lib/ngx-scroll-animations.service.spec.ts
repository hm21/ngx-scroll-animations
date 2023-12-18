import { DOCUMENT } from '@angular/common';
import { ElementRef, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxScrollAnimationsService } from './ngx-scroll-animations.service';
import { ThresholdModeT } from './utils/ngx-scroll-animations-types';

describe('NgxScrollAnimationsService', () => {
  let service: NgxScrollAnimationsService;
  let mockDocument: Document;
  let mockElementRef: ElementRef;
  let mockNgZone: NgZone;

  beforeEach(() => {
    // Mocks for dependencies
    mockDocument = document;
    mockElementRef = new ElementRef(document.createElement('div'));
    mockNgZone = new NgZone({ enableLongStackTrace: false });

    TestBed.configureTestingModule({
      providers: [
        NgxScrollAnimationsService,
        { provide: DOCUMENT, useValue: mockDocument },
        { provide: NgZone, useValue: mockNgZone }
      ]
    });

    service = TestBed.inject(NgxScrollAnimationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test for getCurrentViewport
  describe('getCurrentViewport', () => {
    it('should return the current viewport dimensions', () => {
      const viewport = service.getCurrentViewport();
      expect(viewport.width).toBe(window.innerWidth);
      expect(viewport.height).toBe(window.innerHeight);
    });
  });

  // Test for trigger method
  describe('trigger', () => {
    it('should return an OperatorFunction', () => {
      const threshold = 50;
      const thresholdMode: ThresholdModeT = 'percent';
      const operatorFunction = service.trigger(mockElementRef, threshold, thresholdMode);

      expect(typeof operatorFunction).toBe('function');
    });
  });
});
