import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HistorialClinicoService, HistorialClinicoDto, VeterinarioDto } from '../historial-clinico.service';
import { ModalAgregarConsultaComponent } from '../modal-agregar-consulta/modal-agregar-consulta.component';


type TabKey = 'consultas' | 'vacunas' | 'desparasitaciones' | 'procedimientos' | 'examenes';

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [CommonModule, ModalAgregarConsultaComponent],
  templateUrl: './historial-clinico.component.html',
  styleUrl: './historial-clinico.component.scss',
})
export class HistorialClinicoComponent implements OnInit {
  cargando = false;
  errorMsg = '';

  idMascota = '';
  historial: HistorialClinicoDto | null = null;
  veterinarios: VeterinarioDto[] = [];
  showAddConsulta = false;

  tab: TabKey = 'consultas';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: HistorialClinicoService
  ) {}

  ngOnInit(): void {
    this.idMascota = this.route.snapshot.paramMap.get('idMascota') || '';
    if (!this.idMascota) {
      this.errorMsg = 'No se recibió el id de la mascota.';
      return;
    }
    this.cargarTodo();
  }

  abrirAgregarConsulta() {
  this.showAddConsulta = true;
}

cerrarAddConsulta() {
  this.showAddConsulta = false;
}

onConsultaCreated() {
  this.cargarTodo(); // refresca historial
}

  cargarTodo() {
    this.cargando = true;
    this.errorMsg = '';

    // 1) init (asegura historial) -> 2) get historial
    this.service.initHistorial(this.idMascota).subscribe({
      next: () => {
        this.service.obtenerHistorial(this.idMascota).subscribe({
          next: (h) => {
            this.historial = h;
            this.cargando = false;
          },
          error: (err) => {
            this.cargando = false;
            this.errorMsg = err?.error?.message || 'No se pudo cargar el historial clínico.';
          },
        });
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo inicializar el historial.';
      },
    });

    // Veterinarios en paralelo (para combos en formularios futuros)
    this.service.listarVeterinarios().subscribe({
      next: (res) => (this.veterinarios = res ?? []),
      error: () => (this.veterinarios = []),
    });
  }

  volverPacientes() {
    this.router.navigate(['/pacientes']);
  }

  setTab(t: TabKey) {
    this.tab = t;
  }

  formatDate(d: any): string {
    if (!d) return '-';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return String(d);
    return date.toLocaleString();
  }

  agregarItem() {
  if (this.tab === 'consultas') {
    this.abrirAgregarConsulta();
    return;
  }

  alert('Luego abrimos el modal para: ' + this.tab);
}

}
