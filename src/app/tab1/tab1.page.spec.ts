import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('wraps slides and pauses after manual navigation', () => {
    component.previousSlide();
    expect(component.currentSlide()).toBe(component.collectionSlides.length - 1);
    expect(component.paused()).toBe(true);
    component.nextSlide(); expect(component.currentSlide()).toBe(0);
  });
  it('rotates while active and stops when the tab is left', () => {
    vi.useFakeTimers();
    vi.spyOn(component.shop, 'loadProducts').mockResolvedValue();
    component.ionViewWillEnter();
    vi.advanceTimersByTime(6000); expect(component.currentSlide()).toBe(1);
    component.ionViewDidLeave(); vi.advanceTimersByTime(6000);
    expect(component.currentSlide()).toBe(1); vi.useRealTimers();
  });
  it('changes slides on a horizontal swipe', () => {
    component.pointerDown({ clientX: 200, clientY: 100 } as PointerEvent);
    component.pointerUp({ clientX: 80, clientY: 105 } as PointerEvent);
    expect(component.currentSlide()).toBe(1);
  });
  it('should create' , () => {
    expect(component).toBeTruthy();
  });
});
