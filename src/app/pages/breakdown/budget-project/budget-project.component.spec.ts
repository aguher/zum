import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetProjectComponent } from './budget-project.component';

describe('BudgetProjectComponent', () => {
  let component: BudgetProjectComponent;
  let fixture: ComponentFixture<BudgetProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BudgetProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
