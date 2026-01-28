import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService, UsuarioDto } from '../users.service';
import { ModalAgregarUsuarioComponent } from '../modal-agregar-usuario/modal-agregar-usuario.component';
import { ModalEditarUsuarioComponent } from '../modal-editar-usuario/modal-editar-usuario.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalAgregarUsuarioComponent,ModalEditarUsuarioComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioDto[] = [];
  cargando = false;
  errorMsg = '';
  showAddModal = false;

  showEditModal = false;
usuarioEditando: UsuarioDto | null = null;
 

  filtro = '';

  // paginación
  page = 1;
  pageSize = 10;

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  abrirAdd() { this.showAddModal = true; }

  

   recargar() {
    this.page = 1;         
    this.cargar();
  }

 
  private cargar() {
    this.cargando = true;
    this.errorMsg = '';

    this.usersService.listarActivosSinVeterinario().subscribe({
      next: (res) => {
        this.usuarios = res ?? [];
        this.cargando = false;
      },
      error: (err) => {
        this.usuarios = [];
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudieron cargar los usuarios.';
      }
    });
  }

  // ------- filtros / paginación -------
  get usuariosFiltrados(): UsuarioDto[] {
    const f = (this.filtro || '').trim().toLowerCase();
    if (!f) return this.usuarios;

    return this.usuarios.filter(u => {
      const rol = (u.id_rol?.nombre || '').toLowerCase();
      return (
        (u.nombre_completo || '').toLowerCase().includes(f) ||
        (u.correo || '').toLowerCase().includes(f) ||
        (u.numero_celular || '').toLowerCase().includes(f) ||
        rol.includes(f)
      );
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.usuariosFiltrados.length / this.pageSize));
  }

  get usuariosPaginados(): UsuarioDto[] {
    const start = (this.page - 1) * this.pageSize;
    return this.usuariosFiltrados.slice(start, start + this.pageSize);
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

  // ------- acciones UI -------
  volverMenu() {
    this.router.navigate(['/menu']); // ajusta ruta
  }

  editarUsuario(u: UsuarioDto) {
  this.usuarioEditando = u;
  this.showEditModal = true;
}

  eliminarUsuario(u: UsuarioDto) {
  const ok = confirm(`¿Eliminar al usuario "${u.nombre_completo}"?`);
  if (!ok) return;

  this.cargando = true;
  this.errorMsg = '';

  this.usersService.eliminar(u._id).subscribe({
    next: () => {
      this.cargando = false;
      // refresca lista
      this.recargar(); // o this.cargar() según tu implementación
    },
    error: (err) => {
      this.cargando = false;
      this.errorMsg = err?.error?.message || 'No se pudo eliminar el usuario.';
    },
  });
}

}
