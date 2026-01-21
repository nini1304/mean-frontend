import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HistorialClinicoService,
  VeterinarioDto,
  ApiMessageResponse,
  ActualizarExamenDto
} from '../historial-clinico.service';

@Component({
  selector: 'app-modal-editar-examen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar-examen.component.html',
  styleUrl: './modal-editar-examen.component.scss',
})
export class ModalEditarExamenComponent implements OnInit {
  @Input({ required: true }) idMascota!: string;
  @Input({ required: true }) data!: any; // debe tener _id

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  cargando = false;
  cargandoVets = false;
  cargandoAdjunto = false;

  errorMsg = '';
  okMsg = '';

  vets: VeterinarioDto[] = [];
  form: FormGroup;

  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private service: HistorialClinicoService) {
    this.form = this.fb.group({
      tipo: ['', [Validators.required, Validators.minLength(2)]],
      fecha: ['', [Validators.required]], // date
      resultado: [''],
      id_veterinario: [''],               // opcional
      valoresText: [''],                  // textarea JSON (opcional)
    });
  }

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.patchForm();
  }

  private patchForm() {
    const e = this.data || {};
    this.form.patchValue({
      tipo: e.tipo || '',
      fecha: this.toDateInputValue(e.fecha),
      resultado: e.resultado || '',
      id_veterinario: e.id_veterinario?._id || e.id_veterinario || '',
      valoresText: e.valores ? JSON.stringify(e.valores, null, 2) : '',
    });
  }

  private cargarVeterinarios() {
    this.cargandoVets = true;
    this.service.listarVeterinarios().subscribe({
      next: (res) => {
        this.vets = res ?? [];
        this.cargandoVets = false;

        const current = this.form.get('id_veterinario')?.value;
        if (!current && this.vets.length === 1) {
          this.form.patchValue({ id_veterinario: this.vets[0].id });
        }
      },
      error: () => {
        this.vets = [];
        this.cargandoVets = false;
      },
    });
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedFile = file;
  }

  guardarCambios() {
    this.errorMsg = '';
    this.okMsg = '';
    this.form.markAllAsTouched();

    if (!this.data?._id) {
      this.errorMsg = 'No se encontró el id del examen.';
      return;
    }
    if (this.form.invalid) {
      this.errorMsg = 'Revisa los campos obligatorios.';
      return;
    }

    // parse valores JSON si existe
    let valores: any = undefined;
    const raw = (this.form.value.valoresText || '').trim();
    if (raw) {
      try {
        valores = JSON.parse(raw);
      } catch {
        this.errorMsg = 'El campo "valores" debe ser un JSON válido.';
        return;
      }
    }

    const v = this.form.value;

    const body: ActualizarExamenDto = {
      tipo: (v.tipo || '').trim(),
      fecha: v.fecha,
      resultado: (v.resultado || '').trim(),
      valores: raw ? valores : undefined,
      id_veterinario: v.id_veterinario ? v.id_veterinario : null,
    };

    this.cargando = true;
    this.service.actualizarExamen(this.idMascota, this.data._id, body).subscribe({
      next: (res: ApiMessageResponse) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Examen actualizado correctamente';
        this.updated.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo actualizar el examen.';
      },
    });
  }

  subirAdjunto() {
    this.errorMsg = '';
    this.okMsg = '';

    if (!this.data?._id) {
      this.errorMsg = 'No se encontró el id del examen.';
      return;
    }
    if (!this.selectedFile) {
      this.errorMsg = 'Selecciona un archivo para adjuntar.';
      return;
    }

    this.cargandoAdjunto = true;
    this.service.agregarAdjuntoExamen(this.idMascota, this.data._id, this.selectedFile).subscribe({
      next: (res: ApiMessageResponse) => {
        this.cargandoAdjunto = false;
        this.okMsg = res?.message || 'Adjunto agregado correctamente';
        this.updated.emit(); // para refrescar lista y ver el adjunto
        this.selectedFile = null;
      },
      error: (err) => {
        this.cargandoAdjunto = false;
        this.errorMsg = err?.error?.message || 'No se pudo adjuntar el archivo.';
      },
    });
  }

  cancelar() {
    this.close.emit();
  }

  private toDateInputValue(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
