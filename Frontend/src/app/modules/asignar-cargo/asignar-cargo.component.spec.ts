import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarCargoComponent } from './asignar-cargo.component';

describe('AsignarCargoComponent', () => {
  let component: AsignarCargoComponent;
  let fixture: ComponentFixture<AsignarCargoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarCargoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarCargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
