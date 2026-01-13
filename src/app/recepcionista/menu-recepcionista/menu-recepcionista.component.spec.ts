import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuRecepcionistaComponent } from './menu-recepcionista.component';

describe('MenuRecepcionistaComponent', () => {
  let component: MenuRecepcionistaComponent;
  let fixture: ComponentFixture<MenuRecepcionistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuRecepcionistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuRecepcionistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
