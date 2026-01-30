import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAgregarVeterinarioComponent } from './modal-agregar-veterinario.component';

describe('ModalAgregarVeterinarioComponent', () => {
  let component: ModalAgregarVeterinarioComponent;
  let fixture: ComponentFixture<ModalAgregarVeterinarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAgregarVeterinarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAgregarVeterinarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
