import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgxScrollAnimationsDirective } from './ngx-scroll-animations.directive';

@Component({
  selector: 'app-test-host',
  template: ` <div ngxScrollAnimate></div> `,
})
class TestHostComponent {}

describe('NgxScrollAnimationsDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: NgxScrollAnimationsDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxScrollAnimationsDirective],
      declarations: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    directive = fixture.debugElement
      .query(By.directive(NgxScrollAnimationsDirective))
      .injector.get(NgxScrollAnimationsDirective);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should have default speed set to "300ms"', () => {
    expect(directive.speed).toEqual('300ms');
  });

  it('should have default delay set to empty string', () => {
    expect(directive.delay).toEqual('');
  });

  it('should have default disabled set to false', () => {
    expect(directive.disabled).toBeFalsy();
  });

  it('should have default easing set to "ease"', () => {
    expect(directive.easing).toEqual('ease');
  });

  it('should have default threshold set to 0.8', () => {
    expect(directive['threshold']).toEqual(0.8);
  });

  it('should have default threshold mode set to "percent"', () => {
    expect(directive.thresholdMode).toEqual('percent');
  });

  it('should have default once set to true', () => {
    expect(directive.once).toBeTruthy();
  });

  it('should have default animate set to "fade-in-up"', () => {
    expect(directive.animationName).toEqual('fade-in-up');
  });
});
