import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarDesparasitacionComponent } from './modal-editar-desparasitacion.component';

describe('ModalEditarDesparasitacionComponent', () => {
  let component: ModalEditarDesparasitacionComponent;
  let fixture: ComponentFixture<ModalEditarDesparasitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditarDesparasitacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditarDesparasitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
