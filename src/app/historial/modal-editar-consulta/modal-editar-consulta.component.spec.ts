import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarConsultaComponent } from './modal-editar-consulta.component';

describe('ModalEditarConsultaComponent', () => {
  let component: ModalEditarConsultaComponent;
  let fixture: ComponentFixture<ModalEditarConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditarConsultaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditarConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
