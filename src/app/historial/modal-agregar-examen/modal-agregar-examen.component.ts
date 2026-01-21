import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiMessageResponse, HistorialClinicoService, VeterinarioDto } from '../historial-clinico.service';

@Component({
  selector: 'app-modal-agregar-examen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-agregar-examen.component.html',
  styleUrl: './modal-agregar-examen.component.scss',
})
export class ModalAgregarExamenComponent implements OnInit {
  @Input({ required: true }) idMascota!: string;

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  cargando = false;
  cargandoVets = false;
  errorMsg = '';
  okMsg = '';

  vets: VeterinarioDto[] = [];
  form: FormGroup;

  file: File | null = null;

  // validaciones simples de archivo
  maxBytes = 10 * 1024 * 1024; // 10MB

  constructor(private fb: FormBuilder, private service: HistorialClinicoService) {
    this.form = this.fb.group({
      tipo: ['', [Validators.required, Validators.minLength(2)]],
      fechaLocal: ['', [Validators.required]], // datetime-local
      id_veterinario: [''], // opcional
      resultado: [''],
      valores: [''], // opcional (JSON string)
    });
  }

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.form.patchValue({ fechaLocal: this.toDatetimeLocalValue(new Date()) });
  }

  private cargarVeterinarios() {
    this.cargandoVets = true;
    this.service.listarVeterinarios().subscribe({
      next: (res) => {
        this.vets = res ?? [];
        this.cargandoVets = false;
        if (this.vets.length === 1) this.form.patchValue({ id_veterinario: this.vets[0].id });
      },
      error: () => {
        this.vets = [];
        this.cargandoVets = false;
      },
    });
  }

  onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  this.file = input.files?.[0] ?? null;
}

  submit() {
    this.errorMsg = '';
    this.okMsg = '';
    this.form.markAllAsTouched();

    if (this.form.invalid || !this.file) {
      this.errorMsg = 'Revisa los campos obligatorios y selecciona un archivo.';
      return;
    }

    this.cargando = true;

    const v = this.form.value;

    const body = {
      tipo: (v.tipo || '').trim(),
      fecha: new Date(v.fechaLocal).toISOString(),
      resultado: (v.resultado || '').trim(),
      id_veterinario: v.id_veterinario ? v.id_veterinario : null,
      valores: v.valores ? v.valores : null, // si es JSON string, ok
    };

    this.service.crearExamenConAdjunto(this.idMascota, body, this.file).subscribe({
      next: (res) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Examen registrado con adjunto';
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo registrar el examen.';
      },
    });
  }


  cancelar() {
    this.close.emit();
  }

  private datetimeLocalToISO(value: string): string {
    const d = new Date(value);
    return d.toISOString();
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
