import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubgroupsComponent } from './subgroups.component';

describe('SubgroupsComponent', () => {
  let component: SubgroupsComponent;
  let fixture: ComponentFixture<SubgroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubgroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubgroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
