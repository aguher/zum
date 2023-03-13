import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakdownResumeComponent } from './breakdown-resume.component';

describe('BreakdownResumeComponent', () => {
  let component: BreakdownResumeComponent;
  let fixture: ComponentFixture<BreakdownResumeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BreakdownResumeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreakdownResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
