import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAgregarExamenComponent } from './modal-agregar-examen.component';

describe('ModalAgregarExamenComponent', () => {
  let component: ModalAgregarExamenComponent;
  let fixture: ComponentFixture<ModalAgregarExamenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAgregarExamenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAgregarExamenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
