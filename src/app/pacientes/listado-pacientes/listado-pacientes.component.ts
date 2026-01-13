import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacientesService, UsuarioMascotaDto } from '../paciente.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-listado-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listado-pacientes.component.html',
  styleUrl: './listado-pacientes.component.scss'
})
export class ListadoPacientesComponent implements OnInit {
  cargando = false;
  errorMsg = '';

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

  verDueno(p: UsuarioMascotaDto) {
    this.selected = p;
    this.showOwnerModal = true;
  }

  cerrarModal() {
    this.showOwnerModal = false;
    this.selected = null;
  }

  verHistorial(p: UsuarioMascotaDto) {
    // TODO: aquí luego navegas al historial clínico
    console.log('Historial clínico de:', p.mascota?.nombre, p.mascota?.id);
  }

  agregarPaciente() {
    // TODO: aquí luego abres modal o navegas a formulario de registro
    console.log('Agregar paciente');
  }

  formatEdad(edad: number): string {
    // Si tu backend manda años como entero, se verá "3 años".
    // Si en algún momento mandas meses, aquí puedes ajustar la lógica.
    return `${edad} años`;
  }

  formatPeso(peso: number): string {
    return `${peso} kg`;
  }

  volverMenu() {
    this.router.navigate(['/recepcionista/menu']);
  }

  editarPaciente(p: UsuarioMascotaDto) {
    // TODO: aquí luego abres modal de edición o navegas a /pacientes/editar/:id
    console.log('Editar paciente:', p.mascota.nombre, p.mascota.id);
  }

  eliminarPaciente(p: UsuarioMascotaDto) {
    // Por ahora confirmación simple
    const ok = confirm(`¿Seguro que deseas eliminar a ${p.mascota.nombre}?`);
    if (!ok) return;

    // TODO: conectar endpoint delete lógico/físico cuando lo tengas
    console.log('Eliminar paciente:', p.id_relacion, p.mascota.id);
  }
}
