import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VeterinarioDto } from '../veterianarios.service';

@Component({
  selector: 'app-modal-eliminar-veterinario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-eliminar-veterinario.component.html',
  styleUrl: './modal-eliminar-veterinario.component.scss',
})
export class ModalEliminarVeterinarioComponent {
  @Input() veterinario!: VeterinarioDto;
  @Input() cargando = false;
  @Input() errorMsg = '';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  cerrar() { this.close.emit(); }
  confirmar() { this.confirm.emit(); }
}
