import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarSalasComponent } from './gestionar-salas.component';

describe('GestionarSalasComponent', () => {
  let component: GestionarSalasComponent;
  let fixture: ComponentFixture<GestionarSalasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarSalasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarSalasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
