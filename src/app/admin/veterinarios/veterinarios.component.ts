import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VeterinarioDto, VeterinariosService } from '../veterianarios.service';
import { ModalAgregarVeterinarioComponent } from '../modal-agregar-veterinario/modal-agregar-veterinario.component';
import { ModalHorariosVeterinarioComponent } from '../modal-horarios-veterinario/modal-horarios-veterinario.component';
import { ModalEditarVeterinarioComponent } from '../modal-editar-veterinario/modal-editar-veterinario.component';
import { ModalEliminarVeterinarioComponent } from '../modal-eliminar-veterinario/modal-eliminar-veterinario.component';


@Component({
  selector: 'app-veterinarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalAgregarVeterinarioComponent,ModalHorariosVeterinarioComponent,ModalEditarVeterinarioComponent,ModalEliminarVeterinarioComponent],
  templateUrl: './veterinarios.component.html',
  styleUrl: './veterinarios.component.scss',
})
export class VeterinariosComponent implements OnInit {
  veterinarios: VeterinarioDto[] = [];
  cargando = false;
  errorMsg = '';

  filtro = '';

  // paginación
  page = 1;
  pageSize = 10;

  showAddModal = false;

  showHorariosModal = false;
veterinarioHorarios: VeterinarioDto | null = null;

showEditModal = false;
veterinarioEditando: VeterinarioDto | null = null;

showDeleteModal = false;
veterinarioEliminar: VeterinarioDto | null = null;
deleteErrorMsg = '';
deleteLoading = false;

  constructor(
    private veterinariosService: VeterinariosService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargar();
  }

  abrirAdd() { this.showAddModal = true; }

  

  private cargar() {
    this.cargando = true;
    this.errorMsg = '';

    this.veterinariosService.listarConHorarios(false).subscribe({
      next: (res) => {
        this.veterinarios = res ?? [];
        this.cargando = false;
      },
      error: (err) => {
        this.veterinarios = [];
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudieron cargar los veterinarios.';
      },
    });
  }

  confirmarEliminar(v: VeterinarioDto) {
  this.veterinarioEliminar = v;
  this.deleteErrorMsg = '';
  this.showDeleteModal = true;
}

cancelarEliminar() {
  this.showDeleteModal = false;
  this.veterinarioEliminar = null;
  this.deleteErrorMsg = '';
}

eliminarVeterinario() {
  if (!this.veterinarioEliminar) return;

  this.deleteLoading = true;
  this.deleteErrorMsg = '';

  this.veterinariosService.eliminarLogico(this.veterinarioEliminar.id).subscribe({
    next: () => {
      this.deleteLoading = false;
      this.cancelarEliminar();
      this.recargar();
    },
    error: (err) => {
      this.deleteLoading = false;

      // ✅ backend debe devolver 409 cuando hay pendientes
      if (err?.status === 409) {
        this.deleteErrorMsg = err?.error?.message || 'No se puede eliminar: existen citas PENDIENTE.';
        return;
      }

      this.deleteErrorMsg = err?.error?.message || 'No se pudo eliminar el veterinario.';
    }
  });
}


 
  recargar() {
    this.page = 1;
    this.cargar();
  }

  verHorarios(v: VeterinarioDto) {
  this.veterinarioHorarios = v;
  this.showHorariosModal = true;
}

editarVeterinario(v: VeterinarioDto) {
  this.veterinarioEditando = v;
  this.showEditModal = true;
}


  // ------- filtros / paginación -------
  get veterinariosFiltrados(): VeterinarioDto[] {
    const f = (this.filtro || '').trim().toLowerCase();
    if (!f) return this.veterinarios;

    return this.veterinarios.filter((v) => {
      const u = v.usuario || ({} as any);
      return (
        (u.nombre_completo || '').toLowerCase().includes(f) ||
        (u.correo || '').toLowerCase().includes(f) ||
        (u.numero_celular || '').toLowerCase().includes(f) ||
        (v.especialidad || '').toLowerCase().includes(f)
      );
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.veterinariosFiltrados.length / this.pageSize));
  }

  get veterinariosPaginados(): VeterinarioDto[] {
    const start = (this.page - 1) * this.pageSize;
    return this.veterinariosFiltrados.slice(start, start + this.pageSize);
  }

  prevPage() {
    this.page = Math.max(1, this.page - 1);
  }

  nextPage() {
    this.page = Math.min(this.totalPages, this.page + 1);
  }

  // ------- helpers -------
  formatDate(d: string) {
    if (!d) return '-';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d;
    return date.toLocaleString();
  }

  volverMenu() {
    this.router.navigate(['admin/menu']); // ajusta ruta si tu menú es otra
  }
}
