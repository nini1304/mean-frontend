import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEliminarVeterinarioComponent } from './modal-eliminar-veterinario.component';

describe('ModalEliminarVeterinarioComponent', () => {
  let component: ModalEliminarVeterinarioComponent;
  let fixture: ComponentFixture<ModalEliminarVeterinarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEliminarVeterinarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEliminarVeterinarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
