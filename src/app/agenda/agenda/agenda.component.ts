import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import listPlugin from '@fullcalendar/list';


import { CitaDto, CitasService } from '../citas.service';
import { HistorialClinicoService, VeterinarioDto } from '../../historial/historial-clinico.service'; // o crea un VeterinariosService aparte
import { FormsModule } from '@angular/forms';



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
    private hcService: HistorialClinicoService
  ) { }

  ngOnInit(): void {
    this.cargarVeterinarios();
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
    this.citaSeleccionada = cita;
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
      case 'CANCELADA': return 'ev-cancel';
      default: return 'ev-pending';
    }
  }

  private crearDesdeSeleccion(arg: DateSelectArg) {
    if (!this.idVeterinario) {
      alert('Primero selecciona un veterinario.');
      return;
    }

    const idMascota = prompt('ID Mascota (por ahora):');
    if (!idMascota) return;

    const motivo = prompt('Motivo:') || 'Consulta';

    this.citasService.crear({
      id_veterinario: this.idVeterinario,
      id_mascota: idMascota,
      tipo: 'CITA',
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
      motivo,
      estado: 'PENDIENTE',
    }).subscribe({
      next: () => arg.view.calendar.refetchEvents(),
      error: (err) => alert(err?.error?.message || 'No se pudo crear la cita.')
    });
  }

  private onMover(arg: any) { /* igual que lo tienes */ }
  private onResize(arg: any) { /* igual que lo tienes */ }
  private onClickEvento(arg: EventClickArg) {
    const cita = (arg.event.extendedProps as any) as CitaDto;

    // por si acaso (si extendedProps viene vacío)
    if (!cita) {
      alert('No se pudo leer la información de la cita.');
      return;
    }

    this.abrirDetalle(cita);
  }

}
