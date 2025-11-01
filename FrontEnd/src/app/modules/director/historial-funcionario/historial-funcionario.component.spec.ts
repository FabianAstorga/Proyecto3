import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialFuncionarioComponent } from './historial-funcionario.component';

describe('HistorialFuncionarioComponent', () => {
  let component: HistorialFuncionarioComponent;
  let fixture: ComponentFixture<HistorialFuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialFuncionarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialFuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
