// src/modules/eventos-globales/eventos-globales.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { EventoGlobal } from '../../database/entities/evento-global.entity';
import { GlobalEventDto, DayKey } from './dto/global-event.dto';

@Injectable()
export class EventosGlobalesService {
  constructor(
    @InjectRepository(EventoGlobal)
    private readonly eventoRepo: Repository<EventoGlobal>,
  ) {}

  // ---------- Helpers de fechas (ISO week, en HORARIO LOCAL) ----------

  /**
   * Convierte "2025-W10" en el rango [lunes, domingo] en horario local.
   * No usamos Date.UTC ni setUTCHours para evitar corrimientos de día
   * cuando se guarda en una columna DATE.
   */
  private getWeekRangeFromIso(isoWeek: string): { monday: Date; sunday: Date } {
    const year = Number(isoWeek.slice(0, 4));
    const week = Number(isoWeek.slice(6));

    // 4 de enero del año dado (horario local)
    const simple = new Date(year, 0, 4);
    // getDay(): 0-dom, 1-lun, ..., 6-sab
    const dayOfWeek = simple.getDay() || 7;

    // Lunes de la semana ISO
    const monday = new Date(simple);
    monday.setDate(simple.getDate() - dayOfWeek + 1 + (week - 1) * 7);
    monday.setHours(0, 0, 0, 0); // inicio del día en local

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999); // fin del domingo en local

    return { monday, sunday };
  }

  /**
   * Obtiene la fecha concreta de un dayKey ('lun', 'mar', ...) dentro
   * de la isoWeek indicada, en horario local.
   */
  private getDateByDayKey(isoWeek: string, dayKey: DayKey): Date {
    const { monday } = this.getWeekRangeFromIso(isoWeek);

    const offsetMap: Record<DayKey, number> = {
      lun: 0,
      mar: 1,
      mie: 2,
      jue: 3,
      vie: 4,
    };

    const d = new Date(monday);
    d.setDate(monday.getDate() + offsetMap[dayKey]);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ---------- Consultar eventos por semana ----------

  async getByWeek(isoWeek: string): Promise<EventoGlobal[]> {
    const { monday, sunday } = this.getWeekRangeFromIso(isoWeek);

    return this.eventoRepo.find({
      where: {
        fecha: Between(monday, sunday),
      },
      order: { fecha: 'ASC', blockCode: 'ASC' },
    });
  }

  // ---------- Reemplazar todos los eventos de una semana ----------

  async replaceForWeek(
    isoWeek: string,
    items: GlobalEventDto[],
  ): Promise<EventoGlobal[]> {
    const { monday, sunday } = this.getWeekRangeFromIso(isoWeek);

    // 1) Borrar eventos anteriores de esa semana
    await this.eventoRepo.delete({
      fecha: Between(monday, sunday),
    });

    // 2) Insertar los nuevos
    const toSave: EventoGlobal[] = items.map((dto) => {
      const e = new EventoGlobal();
      e.fecha = this.getDateByDayKey(isoWeek, dto.dayKey);
      e.blockCode = dto.blockCode;
      e.titulo = dto.titulo;
      e.descripcion = dto.descripcion ?? null;
      return e;
    });

    return this.eventoRepo.save(toSave);
  }
}
