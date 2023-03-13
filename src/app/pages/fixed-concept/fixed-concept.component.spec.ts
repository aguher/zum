import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedConceptComponent } from './fixed-concept.component';

describe('FixedConceptComponent', () => {
  let component: FixedConceptComponent;
  let fixture: ComponentFixture<FixedConceptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedConceptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedConceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
