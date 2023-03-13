import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RowDifferencesComponent } from './row-differences.component';

describe('RowDifferencesComponent', () => {
  let component: RowDifferencesComponent;
  let fixture: ComponentFixture<RowDifferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RowDifferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RowDifferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
