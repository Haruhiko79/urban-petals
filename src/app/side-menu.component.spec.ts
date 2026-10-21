import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SideMenuComponent } from './side-menu.component';

describe('SideMenuComponent', () => {
  it('creates the menu', async () => {
    await TestBed.configureTestingModule({
      imports: [SideMenuComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(SideMenuComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
