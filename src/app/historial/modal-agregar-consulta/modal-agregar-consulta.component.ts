import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HistorialClinicoService, VeterinarioDto } from '../historial-clinico.service';

@Component({
  selector: 'app-modal-agregar-consulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-agregar-consulta.component.html',
  styleUrl: './modal-agregar-consulta.component.scss',
})
export class ModalAgregarConsultaComponent implements OnInit {
  @Input({ required: true }) idMascota!: string;

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  cargando = false;
  cargandoVets = false;
  errorMsg = '';
  okMsg = '';

  vets: VeterinarioDto[] = [];

  form: FormGroup;

  constructor(private fb: FormBuilder, private historialService: HistorialClinicoService) {
    this.form = this.fb.group({
      fechaLocal: ['', [Validators.required]], // datetime-local
      id_veterinario: ['', [Validators.required]],
      motivo_consulta: ['', [Validators.required, Validators.minLength(3)]],
      peso_en_consulta: [null, [Validators.required, Validators.min(0)]],
      temperatura: [null, [Validators.min(0)]],
      diagnostico: [''],
      tratamiento: [''],
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    this.cargarVeterinarios();
    // sugerencia: poner fecha actual por defecto
    const now = new Date();
    const local = this.toDatetimeLocalValue(now);
    this.form.patchValue({ fechaLocal: local });
  }

  private cargarVeterinarios() {
    this.cargandoVets = true;
    this.historialService.listarVeterinarios().subscribe({
      next: (res) => {
        this.vets = res ?? [];
        this.cargandoVets = false;

        // si hay 1 solo vet, lo selecciona
        if (this.vets.length === 1) {
          this.form.patchValue({ id_veterinario: this.vets[0].id });
        }
      },
      error: () => {
        this.vets = [];
        this.cargandoVets = false;
      },
    });
  }

  submit() {
    this.errorMsg = '';
    this.okMsg = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.errorMsg = 'Revisa los campos obligatorios.';
      return;
    }

    this.cargando = true;

    const v = this.form.value;
    const body = {
      fecha: this.datetimeLocalToISO(v.fechaLocal),
      id_veterinario: v.id_veterinario,
      motivo_consulta: (v.motivo_consulta || '').trim(),
      peso_en_consulta: Number(v.peso_en_consulta),
      temperatura: v.temperatura === null || v.temperatura === '' ? null : Number(v.temperatura),
      diagnostico: (v.diagnostico || '').trim(),
      tratamiento: (v.tratamiento || '').trim(),
      observaciones: (v.observaciones || '').trim(),
    };

    this.historialService.crearConsulta(this.idMascota, body).subscribe({
      next: (res) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Consulta registrada correctamente';
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo registrar la consulta.';
      },
    });
  }

  cancelar() {
    this.close.emit();
  }

  // helpers de fecha
  private datetimeLocalToISO(value: string): string {
    // value: "YYYY-MM-DDTHH:mm"
    const d = new Date(value);
    return d.toISOString();
    // Nota: toISOString convierte a UTC. Es ideal si el backend guarda Date.
  }

  private toDatetimeLocalValue(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }
}
