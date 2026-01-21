import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAgregarDesparasitacionComponent } from './modal-agregar-desparasitacion.component';

describe('ModalAgregarDesparasitacionComponent', () => {
  let component: ModalAgregarDesparasitacionComponent;
  let fixture: ComponentFixture<ModalAgregarDesparasitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAgregarDesparasitacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAgregarDesparasitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
