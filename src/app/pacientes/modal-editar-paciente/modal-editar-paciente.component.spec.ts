import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarPacienteComponent } from './modal-editar-paciente.component';

describe('ModalEditarPacienteComponent', () => {
  let component: ModalEditarPacienteComponent;
  let fixture: ComponentFixture<ModalEditarPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditarPacienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditarPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
