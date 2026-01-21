import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarVacunaComponent } from './modal-editar-vacuna.component';

describe('ModalEditarVacunaComponent', () => {
  let component: ModalEditarVacunaComponent;
  let fixture: ComponentFixture<ModalEditarVacunaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditarVacunaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditarVacunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
