import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHorariosVeterinarioComponent } from './modal-horarios-veterinario.component';

describe('ModalHorariosVeterinarioComponent', () => {
  let component: ModalHorariosVeterinarioComponent;
  let fixture: ComponentFixture<ModalHorariosVeterinarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalHorariosVeterinarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalHorariosVeterinarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
