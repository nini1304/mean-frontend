import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAgregarPacienteComponent } from './modal-agregar-paciente.component';

describe('ModalAgregarPacienteComponent', () => {
  let component: ModalAgregarPacienteComponent;
  let fixture: ComponentFixture<ModalAgregarPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAgregarPacienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAgregarPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
