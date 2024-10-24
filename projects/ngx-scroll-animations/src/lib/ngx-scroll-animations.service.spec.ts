import { DOCUMENT } from '@angular/common';
import {
  ElementRef,
  provideExperimentalZonelessChangeDetection
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxScrollAnimationsService } from './ngx-scroll-animations.service';

describe('NgxScrollAnimationsService', () => {
  let service: NgxScrollAnimationsService;
  let mockDocument: Document;
  let mockElementRef: ElementRef;

  beforeEach(() => {
    // Mocks for dependencies
    mockDocument = document;
    mockElementRef = new ElementRef(document.createElement('div'));

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        NgxScrollAnimationsService,
        { provide: DOCUMENT, useValue: mockDocument },
      ],
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
});
