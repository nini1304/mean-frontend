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
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
      0: 'Domingo',
    };
    return map[n] ?? `Día ${n}`;
  }

  get horariosOrdenados(): HorarioDto[] {
    const hs = (this.veterinario?.horarios ?? []).slice();
    hs.sort((a, b) => (a.dia_semana ?? 0) - (b.dia_semana ?? 0) || (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));
    return hs;
  }
}
