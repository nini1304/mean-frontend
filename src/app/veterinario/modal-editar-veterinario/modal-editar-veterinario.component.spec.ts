import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarVeterinarioComponent } from './modal-editar-veterinario.component';

describe('ModalEditarVeterinarioComponent', () => {
  let component: ModalEditarVeterinarioComponent;
  let fixture: ComponentFixture<ModalEditarVeterinarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditarVeterinarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditarVeterinarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
