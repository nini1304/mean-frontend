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
import { Router } from '@angular/router';
import esLocale from '@fullcalendar/core/locales/es';
import { VeterinariosService, HorarioDto, VeterinarioDto as VetConHorarioDto } from '../../veterinario/veterianarios.service';




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

  horariosSeleccionados: HorarioDto[] = [];
  horariosPorDia: Record<number, HorarioDto[]> = {};
  vetSeleccionado: VetConHorarioDto | null = null;


  dias = [
    { id: 0, nombre: 'Domingo' },
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
  ];


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
    locale: esLocale, // ✅ aquí (reemplaza 'es')
    buttonText: {     // ✅ opcional (pero recomendado)
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista',
    },
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
    private mascotasService: MascotasService,
    private router: Router,
    private veterinariosService: VeterinariosService, // ✅ nuevo
  ) { }


  ngOnInit(): void {
    this.cargarVeterinarios();
    this.cargarMascotas();
  }

  volverMenu() {
    this.router.navigate(['recepcionista/menu']); // ajusta ruta
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

    this.veterinariosService.listarConHorarios(true).subscribe({
      next: (res) => {
        // OJO: tu vets actual es VeterinarioDto (del HC). Aquí usamos el de VeterinariosService
        // Si ya estabas usando "vets: VeterinarioDto[]" desde historial, cámbialo a VetConHorarioDto[].
        this.vets = (res ?? []) as any;
        this.cargandoVets = false;

        if (this.vets.length === 1) {
          this.idVeterinario = (this.vets[0] as any).id;
          this.onVeterinarioChange(this.idVeterinario);
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

    const v = (this.vets as any[]).find(x => x.id === this.idVeterinario) as VetConHorarioDto | undefined;
    this.vetSeleccionado = v ?? null;

    const horarios = (v?.horarios ?? []).filter(h => h.activo !== false);
    this.horariosSeleccionados = horarios;
    this.horariosPorDia = this.groupHorariosPorDia(horarios);

    // ✅ (opcional recomendado) limita visualmente con businessHours
    this.setBusinessHoursFromHorarios(horarios);

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

  private groupHorariosPorDia(horarios: HorarioDto[]) {
    const map: Record<number, HorarioDto[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const h of horarios) {
      const d = Number(h.dia_semana);
      if (!map[d]) map[d] = [];
      map[d].push(h);
    }
    // ordena por hora
    for (const d of Object.keys(map)) {
      map[Number(d)].sort((a, b) => (a.hora_inicio > b.hora_inicio ? 1 : -1));
    }
    return map;
  }

  private setBusinessHoursFromHorarios(horarios: HorarioDto[]) {
    const api = this.calendar?.getApi();
    if (!api) return;

    const businessHours = horarios.map(h => ({
      daysOfWeek: [h.dia_semana], // 0..6
      startTime: h.hora_inicio,   // "08:00"
      endTime: h.hora_fin,        // "12:00"
    }));

    // actualiza opciones en caliente
    api.setOption('businessHours', businessHours);

    // (opcional) ajusta rango visible del timeGrid según min/max del vet
    const min = this.minHora(horarios) ?? '07:00';
    const max = this.maxHora(horarios) ?? '19:00';
    api.setOption('slotMinTime', min);
    api.setOption('slotMaxTime', max);
  }

  private minHora(horarios: HorarioDto[]) {
    if (!horarios.length) return null;
    return horarios.reduce((m, h) => h.hora_inicio < m ? h.hora_inicio : m, horarios[0].hora_inicio);
  }

  private maxHora(horarios: HorarioDto[]) {
    if (!horarios.length) return null;
    return horarios.reduce((m, h) => h.hora_fin > m ? h.hora_fin : m, horarios[0].hora_fin);
  }







}
