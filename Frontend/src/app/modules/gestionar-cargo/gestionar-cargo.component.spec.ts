import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarCargoComponent } from './gestionar-cargo.component';

describe('GestionarCargoComponent', () => {
  let component: GestionarCargoComponent;
  let fixture: ComponentFixture<GestionarCargoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarCargoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarCargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
