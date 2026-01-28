import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VeterinarioDto, HorarioDto } from '../veterianarios.service';

@Component({
  selector: 'app-modal-horarios-veterinario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-horarios-veterinario.component.html',
  styleUrl: './modal-horarios-veterinario.component.scss',
})
export class ModalHorariosVeterinarioComponent {
  @Input() veterinario!: VeterinarioDto;
  @Output() close = new EventEmitter<void>();

  cerrar() { this.close.emit(); }

  // backend te está devolviendo 0..6 en tu ejemplo
  diaLabel(n: number): string {
    const map: Record<number, string> = {
      0: 'Lunes',
      1: 'Martes',
      2: 'Miércoles',
      3: 'Jueves',
      4: 'Viernes',
      5: 'Sábado',
      6: 'Domingo',
    };
    return map[n] ?? `Día ${n}`;
  }

  get horariosOrdenados(): HorarioDto[] {
    const hs = (this.veterinario?.horarios ?? []).slice();
    hs.sort((a, b) => (a.dia_semana ?? 0) - (b.dia_semana ?? 0) || (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));
    return hs;
  }
}
