import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacientesService, UsuarioMascotaDto } from '../paciente.service';
import { Router } from '@angular/router';
import { ModalAgregarPacienteComponent } from '../modal-agregar-paciente/modal-agregar-paciente.component';
import { ModalEditarPacienteComponent } from '../modal-editar-paciente/modal-editar-paciente.component';



@Component({
  selector: 'app-listado-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalAgregarPacienteComponent, ModalEditarPacienteComponent],
  templateUrl: './listado-pacientes.component.html',
  styleUrl: './listado-pacientes.component.scss'
})
export class ListadoPacientesComponent implements OnInit {
  cargando = false;
  errorMsg = '';

  pageSize = 20;
  page = 1;

  showAddModal = false;

  showEditModal = false;
selectedToEdit: UsuarioMascotaDto | null = null;


  pacientes: UsuarioMascotaDto[] = [];
  filtro = '';

  // Modal dueño
  showOwnerModal = false;
  selected: UsuarioMascotaDto | null = null;

  constructor(private pacientesService: PacientesService, private router: Router) { }

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.errorMsg = '';

    this.pacientesService.listarMascotas().subscribe({
      next: (res) => {
        this.pacientes = res ?? [];
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'Error al cargar pacientes';
      },
    });
  }

  get pacientesFiltrados(): UsuarioMascotaDto[] {
  const q = this.filtro.trim().toLowerCase();
  if (!q) return this.pacientes;

  return this.pacientes.filter((p) => {
    const n = p.mascota?.nombre?.toLowerCase() ?? '';
    const r = p.mascota?.raza?.toLowerCase() ?? '';
    const t = p.mascota?.tipo_mascota?.toLowerCase() ?? '';
    const d = p.dueno?.nombre_completo?.toLowerCase() ?? '';
    return n.includes(q) || r.includes(q) || t.includes(q) || d.includes(q);
  });
}

get totalPages(): number {
  return Math.max(1, Math.ceil(this.pacientesFiltrados.length / this.pageSize));
}

get pacientesPaginados(): UsuarioMascotaDto[] {
  // si la página actual queda fuera (ej. cambias filtro), la corregimos
  if (this.page > this.totalPages) this.page = this.totalPages;

  const start = (this.page - 1) * this.pageSize;
  return this.pacientesFiltrados.slice(start, start + this.pageSize);
}


  verDueno(p: UsuarioMascotaDto) {
    this.selected = p;
    this.showOwnerModal = true;
  }

  cerrarModal() {
    this.showOwnerModal = false;
    this.selected = null;
  }

  verHistorial(p: UsuarioMascotaDto) {
  this.router.navigate(['/historial', p.mascota.id]);
}


  

  

  formatPeso(peso: number): string {
    return `${peso} kg`;
  }

  volverMenu() {
    this.router.navigate(['/recepcionista/menu']);
  }

 editarPaciente(p: UsuarioMascotaDto) {
  this.selectedToEdit = p;
  this.showEditModal = true;
}

cerrarEditModal() {
  this.showEditModal = false;
  this.selectedToEdit = null;
}

onUpdated() {
  this.cargar(); // refresca tabla
}

  eliminarPaciente(p: UsuarioMascotaDto) {
  const ok = confirm(`¿Seguro que deseas eliminar a ${p.mascota.nombre}?`);
  if (!ok) return;

  this.pacientesService.eliminarMascota(p.mascota.id).subscribe({
    next: () => {
      // Quitarlo del arreglo local para reflejarlo al instante
      this.pacientes = this.pacientes.filter(x => x.mascota.id !== p.mascota.id);

      // Ajustar página si te quedas sin registros en la última
      if (this.page > this.totalPages) this.page = this.totalPages;
    },
    error: (err) => {
      alert(err?.error?.message || 'No se pudo eliminar el paciente.');
    },
  });
}


  prevPage() {
  if (this.page > 1) this.page--;
}

nextPage() {
  if (this.page < this.totalPages) this.page++;
}

goToPage(p: number) {
  if (p < 1) p = 1;
  if (p > this.totalPages) p = this.totalPages;
  this.page = p;
}

 agregarPaciente() {
    this.showAddModal = true;
  }

  cerrarAddModal() {
    this.showAddModal = false;
  }

  onCreated() {
    this.cargar(); // refresca tabla
  }

}
