import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAgregarVacunaComponent } from './modal-agregar-vacuna.component';

describe('ModalAgregarVacunaComponent', () => {
  let component: ModalAgregarVacunaComponent;
  let fixture: ComponentFixture<ModalAgregarVacunaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAgregarVacunaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAgregarVacunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
