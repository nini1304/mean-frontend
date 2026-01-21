import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAgregarProcedimientoComponent } from './modal-agregar-procedimiento.component';

describe('ModalAgregarProcedimientoComponent', () => {
  let component: ModalAgregarProcedimientoComponent;
  let fixture: ComponentFixture<ModalAgregarProcedimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAgregarProcedimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAgregarProcedimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
