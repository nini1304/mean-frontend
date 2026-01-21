import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HistorialClinicoService, HistorialClinicoDto, VeterinarioDto } from '../historial-clinico.service';
import { ModalAgregarConsultaComponent } from '../modal-agregar-consulta/modal-agregar-consulta.component';
import { ModalAgregarVacunaComponent } from '../modal-agregar-vacuna/modal-agregar-vacuna.component';
import { ModalAgregarDesparasitacionComponent } from '../modal-agregar-desparasitacion/modal-agregar-desparasitacion.component';
import { ModalAgregarProcedimientoComponent } from '../modal-agregar-procedimiento/modal-agregar-procedimiento.component';
import { ModalAgregarExamenComponent } from '../modal-agregar-examen/modal-agregar-examen.component';




type TabKey = 'consultas' | 'vacunas' | 'desparasitaciones' | 'procedimientos' | 'examenes';

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [CommonModule, ModalAgregarConsultaComponent, ModalAgregarVacunaComponent, ModalAgregarDesparasitacionComponent,ModalAgregarProcedimientoComponent,ModalAgregarExamenComponent ],
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
  showAddVacuna = false;
  showAddDesparasitacion = false;
  showAddProcedimiento = false;
  showAddExamen = false;

  tab: TabKey = 'consultas';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: HistorialClinicoService
  ) { }

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

  abrirAgregarVacuna() { this.showAddVacuna = true; }
  cerrarAddVacuna() { this.showAddVacuna = false; }
  onVacunaCreated() { this.cargarTodo(); }

  abrirAgregarDesparasitacion() { this.showAddDesparasitacion = true; }
  cerrarAddDesparasitacion() { this.showAddDesparasitacion = false; }
  onDesparasitacionCreated() { this.cargarTodo(); }

  abrirAgregarProcedimiento() { this.showAddProcedimiento = true; }
 cerrarAddProcedimiento() { this.showAddProcedimiento = false; }
 onProcedimientoCreated() { this.cargarTodo(); }

 abrirAgregarExamen() { this.showAddExamen = true; }
cerrarAddExamen() { this.showAddExamen = false; }
onExamenCreated() { this.cargarTodo(); }

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
    console.log('TAB =>', this.tab);


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

    if (this.tab === 'vacunas') {           // 👈 NUEVO
      this.abrirAgregarVacuna();
      return;
    }
    if (this.tab === 'desparasitaciones') { this.abrirAgregarDesparasitacion(); return; }
    if (this.tab === 'procedimientos') { this.abrirAgregarProcedimiento(); return; }
    if (this.tab === 'examenes') { this.abrirAgregarExamen(); return; }

    alert('Luego abrimos el modal para: ' + this.tab);
  }

}
