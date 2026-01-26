import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import listPlugin from '@fullcalendar/list';
import type { EstadoCita } from '../citas.service';


import { CitaDto, CitasService } from '../citas.service';
import { HistorialClinicoService, VeterinarioDto } from '../../historial/historial-clinico.service'; // o crea un VeterinariosService aparte
import { FormsModule } from '@angular/forms';



import { TipoCita } from '../citas.service';
import { MascotasService, MascotaRelacionDto } from '../mascotas.service';



@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class AgendaComponent implements OnInit {
  @ViewChild(FullCalendarComponent) calendar!: FullCalendarComponent;

  vets: VeterinarioDto[] = [];
  idVeterinario: string = ''; // 👈 vacío al inicio

  cargando = false;
  errorMsg = '';
  cargandoVets = false;

  showDetalle = false;
  citaSeleccionada: CitaDto | null = null;


  mascotas: MascotaRelacionDto[] = [];
  showCrear = false;
  crearError = '';

  estadoTmp: EstadoCita = 'PENDIENTE';


  toastMsg = '';
  private toastTimer: any;

  form = {
    id_mascota: '',
    tipo: 'CONSULTA' as TipoCita,
    startLocal: '',
    endLocal: '',
    motivo: ''
  };



  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    locale: 'es',
    selectable: true,
    selectMirror: true,
    editable: true,
    eventResizableFromStart: true,
    nowIndicator: true,
    height: 'auto',

    // 👇 NO llamar backend si no hay veterinario seleccionado
    events: (info, successCallback, failureCallback) => {
      if (!this.idVeterinario) {
        successCallback([]); // sin vet seleccionado: agenda vacía
        return;
      }
      this.cargarEventos(info.start.toISOString(), info.end.toISOString(), successCallback, failureCallback);
    },

    select: (arg) => this.crearDesdeSeleccion(arg as DateSelectArg),
    eventDrop: (arg) => this.onMover(arg as any),
    eventResize: (arg) => this.onResize(arg as any),
    eventClick: (arg) => this.onClickEvento(arg as EventClickArg),
  };

  constructor(
    private citasService: CitasService,
    private hcService: HistorialClinicoService,
    private mascotasService: MascotasService
  ) { }

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.cargarMascotas();
  }

  private showToast(msg: string) {
  this.toastMsg = msg;
  clearTimeout(this.toastTimer);
  this.toastTimer = setTimeout(() => (this.toastMsg = ''), 2500);
}

  private cargarMascotas() {
    this.mascotasService.listar().subscribe({
      next: (res) => this.mascotas = res ?? [],
      error: () => this.mascotas = []
    });
  }


  getVetNombre(c: CitaDto): string {
    const vet: any = c.id_veterinario;
    return vet?.id_usuario?.nombre_completo ?? '-';
  }

  getVetEspecialidad(c: CitaDto): string {
    const vet: any = c.id_veterinario;
    return vet?.especialidad ?? '';
  }

  getMascotaNombre(c: CitaDto): string {
    const m: any = c.id_mascota;
    return m?.nombre ?? '-';
  }

  getMascotaTipo(c: CitaDto): string {
    const m: any = c.id_mascota;
    return m?.tipo_mascota?.tipo_mascota ?? '';
  }


  abrirDetalle(cita: CitaDto) {
  // copia editable (evita el "read-only" de FullCalendar)
  this.citaSeleccionada = { ...cita };
  this.estadoTmp = (cita.estado as any) ?? 'PENDIENTE';
  this.showDetalle = true;
}


  cerrarDetalle() {
    this.showDetalle = false;
    this.citaSeleccionada = null;
  }

  formatDate(d: any): string {
    if (!d) return '-';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return String(d);
    return date.toLocaleString();
  }

  cancelarDesdeModal(idCita: string) {
    const ok = confirm('¿Seguro que deseas cancelar esta cita?');
    if (!ok) return;

    const motivo = prompt('Motivo de cancelación:') || 'Cancelada';

    this.citasService.cancelar(idCita, { motivo }).subscribe({
      next: () => {
        this.cerrarDetalle();
        this.refetchCalendar();
      },
      error: (err) => alert(err?.error?.message || 'No se pudo cancelar la cita.'),
    });
  }



  private cargarVeterinarios() {
    this.cargandoVets = true;
    this.hcService.listarVeterinarios().subscribe({
      next: (res) => {
        this.vets = res ?? [];
        this.cargandoVets = false;

        // 👇 si solo hay uno, lo seleccionamos automáticamente
        if (this.vets.length === 1) {
          this.idVeterinario = this.vets[0].id;
          // refresca eventos
          setTimeout(() => this.refetchCalendar(), 0);
        }
      },
      error: () => {
        this.vets = [];
        this.cargandoVets = false;
      },
    });
  }

  onVeterinarioChange(value: string) {
    this.idVeterinario = value || '';
    this.refetchCalendar();
  }

  private refetchCalendar() {
    this.calendar?.getApi()?.refetchEvents();
  }


  private cargarEventos(startISO: string, endISO: string, ok: (events: any[]) => void, fail: (err: any) => void) {
    this.cargando = true;
    this.errorMsg = '';

    this.citasService.listarPorRango({
      start: startISO,
      end: endISO,
      id_veterinario: this.idVeterinario, // 👈 ya siempre válido
    }).subscribe({
      next: (citas: CitaDto[]) => {
        this.cargando = false;
        ok((citas ?? []).map(c => ({
          id: c._id,
          title: this.buildTitle(c),
          start: c.start,
          end: c.end,
          extendedProps: c,
          classNames: [this.classByEstado(c.estado)],
        })));
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudieron cargar las citas.';
        fail(err);
      }
    });
  }

  private buildTitle(c: CitaDto) { return `${c.tipo} · ${c.estado}`; }

private classByEstado(estado: string) {
  switch (estado) {
    case 'CONFIRMADA': return 'ev-ok';
    case 'COMPLETADA': return 'ev-ok';
    case 'NO_ASISTIO': return 'ev-cancel';
    case 'CANCELADA': return 'ev-cancel';
    default: return 'ev-pending';
  }
}




  private onMover(arg: any) { /* igual que lo tienes */ }
  private onResize(arg: any) { /* igual que lo tienes */ }
  private onClickEvento(arg: EventClickArg) {
  const cita = (arg.event.extendedProps as any) as CitaDto;
  this.abrirDetalle({ ...cita });
}




  getVetNombreFromSelected(): string {
    const v = this.vets.find(x => x.id === this.idVeterinario);
    return v ? `${v.usuario.nombre_completo} · ${v.especialidad}` : '-';
  }

  private crearDesdeSeleccion(arg: DateSelectArg) {
    if (!this.idVeterinario) {
      alert('Primero selecciona un veterinario.');
      return;
    }

    // FullCalendar ya te da start/end
    this.abrirCrearConRango(arg.start, arg.end);
  }

  abrirNuevaCita() {
    if (!this.idVeterinario) return;
    // Por defecto: ahora + 30 min
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 60000);
    this.abrirCrearConRango(now, end);
  }

  private abrirCrearConRango(start: Date, end: Date) {
    this.crearError = '';
    this.form = {
      id_mascota: '',
      tipo: 'CONSULTA',
      startLocal: this.toLocalInputValue(start),
      endLocal: this.toLocalInputValue(end),
      motivo: ''
    };
    this.showCrear = true;
  }

  cerrarCrear() {
    this.showCrear = false;
    this.crearError = '';
  }

  private toLocalInputValue(d: Date): string {
    // yyyy-MM-ddTHH:mm (sin Z)
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }


  guardarCita() {
    if (!this.idVeterinario) {
      this.crearError = 'Selecciona un veterinario.';
      return;
    }
    if (!this.form.id_mascota) {
      this.crearError = 'Selecciona una mascota.';
      return;
    }
    if (!this.form.startLocal || !this.form.endLocal) {
      this.crearError = 'Completa inicio y fin.';
      return;
    }

    const start = new Date(this.form.startLocal);
    const end = new Date(this.form.endLocal);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      this.crearError = 'Fechas inválidas.';
      return;
    }
    if (end <= start) {
      this.crearError = 'La hora fin debe ser mayor a la hora inicio.';
      return;
    }

    this.citasService.crear({
      id_veterinario: this.idVeterinario,
      id_mascota: this.form.id_mascota,
      tipo: this.form.tipo,          // ✅ CONSULTA/VACUNA/CONTROL/CIRUGIA/OTRO
      start: start.toISOString(),
      end: end.toISOString(),
      notas: this.form.motivo || undefined,
      estado: 'PENDIENTE'
    }).subscribe({
      next: () => {
        this.cerrarCrear();
        this.refetchCalendar();
      },
      error: (err) => {
        this.crearError = err?.error?.message || 'No se pudo crear la cita.';
      }
    });
  }

  onCambiarEstado(nuevoEstado: EstadoCita) {
  if (!this.citaSeleccionada) return;

  const id = this.citaSeleccionada._id;
  const prev = this.estadoTmp;

  // UI inmediata
  this.estadoTmp = nuevoEstado;
  this.citaSeleccionada = { ...this.citaSeleccionada, estado: nuevoEstado };
  this.patchCalendarEvent(id, { estado: nuevoEstado });

  this.showToast('Guardando...');

  this.citasService.cambiarEstado(id, { estado: nuevoEstado }).subscribe({
    next: () => {
      this.showToast('✅ Estado actualizado');
      setTimeout(() => this.refetchCalendar(), 0);
    },
    error: (err) => {
      // revertir
      this.estadoTmp = prev;
      this.citaSeleccionada = { ...this.citaSeleccionada!, estado: prev };
      this.patchCalendarEvent(id, { estado: prev });

      alert(err?.error?.message || 'No se pudo cambiar el estado.');
    }
  });
}




  private patchCalendarEvent(idCita: string, patch: Partial<CitaDto>) {
  const api = this.calendar?.getApi();
  if (!api) return;

  const ev = api.getEventById(idCita);
  console.log('[patchCalendarEvent] id:', idCita, 'found?', !!ev);
  if (!ev) {
    // si no lo encuentra (raro), al menos fuerza recarga
    api.refetchEvents();
    return;
  }

  // extendedProps contiene el objeto CitaDto que tú metiste
  const current = (ev.extendedProps as any) as CitaDto;
  const updated: CitaDto = { ...current, ...patch } as any;

  // 1) actualiza props que afectan visual
  ev.setProp('title', this.buildTitle(updated));

  // classNames a veces se acumula; esto lo “resetea”
  ev.setProp('classNames', [this.classByEstado(updated.estado as any)]);

  // 2) actualiza lo que lees en el modal (extendedProps)
  // como extendedProps era tu CitaDto, seteamos campos clave:
  if (patch.estado) ev.setExtendedProp('estado', patch.estado);
  if (patch.notas) ev.setExtendedProp('notas', patch.notas);
  if ((patch as any).motivo) ev.setExtendedProp('motivo', (patch as any).motivo);
}






}
