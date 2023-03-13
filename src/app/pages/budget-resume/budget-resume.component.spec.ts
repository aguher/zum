import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetResumeComponent } from './budget-resume.component';

describe('BudgetResumeComponent', () => {
  let component: BudgetResumeComponent;
  let fixture: ComponentFixture<BudgetResumeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BudgetResumeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
