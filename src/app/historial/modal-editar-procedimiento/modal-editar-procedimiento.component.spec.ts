import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarProcedimientoComponent } from './modal-editar-procedimiento.component';

describe('ModalEditarProcedimientoComponent', () => {
  let component: ModalEditarProcedimientoComponent;
  let fixture: ComponentFixture<ModalEditarProcedimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditarProcedimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditarProcedimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
