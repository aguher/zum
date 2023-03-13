import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableConceptComponent } from './variable-concept.component';

describe('VariableConceptComponent', () => {
  let component: VariableConceptComponent;
  let fixture: ComponentFixture<VariableConceptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariableConceptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableConceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
