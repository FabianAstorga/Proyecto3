// src/modules/eventos-globales/eventos-globales.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { EventoGlobal } from '../../database/entities/evento-global.entity';
import { GlobalEventDto, DayKey } from './dto/global-event.dto';
import { GlobalEventOutDto } from './dto/global-event-out.dto';

@Injectable()
export class EventosGlobalesService {
  constructor(
    @InjectRepository(EventoGlobal)
    private readonly eventoRepo: Repository<EventoGlobal>,
  ) {}

  // ---------- Helpers de fechas (ISO week, horario local) ----------

  private getWeekRangeFromIso(isoWeek: string): { monday: Date; sunday: Date } {
    const year = Number(isoWeek.slice(0, 4));
    const week = Number(isoWeek.slice(6));

    const simple = new Date(year, 0, 4);
    const dayOfWeek = simple.getDay() || 7;

    const monday = new Date(simple);
    monday.setDate(simple.getDate() - dayOfWeek + 1 + (week - 1) * 7);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(0, 0, 0, 0);

    return { monday, sunday };
  }

  private toDateOnlyString(d: Date): string {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  private getDateByDayKey(isoWeek: string, dayKey: DayKey): string {
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

    return this.toDateOnlyString(d);
  }

  private toOutDto(e: EventoGlobal): GlobalEventOutDto {
    return {
      id: e.id,
      fecha: e.fecha, // ya viene YYYY-MM-DD (string)
      blockCode: e.blockCode,
      titulo: e.titulo,
      descripcion: e.descripcion,
    };
  }

  // ---------- Consultar eventos por semana ----------

  async getByWeek(isoWeek: string): Promise<GlobalEventOutDto[]> {
    const { monday, sunday } = this.getWeekRangeFromIso(isoWeek);

    const from = this.toDateOnlyString(monday);
    const to = this.toDateOnlyString(sunday);

    const items = await this.eventoRepo.find({
      where: { fecha: Between(from, to) },
      order: { fecha: 'ASC', blockCode: 'ASC' },
    });

    return items.map((e) => this.toOutDto(e));
  }

  // ---------- Reemplazar todos los eventos de una semana ----------

  async replaceForWeek(
    isoWeek: string,
    items: GlobalEventDto[],
  ): Promise<GlobalEventOutDto[]> {
    const { monday, sunday } = this.getWeekRangeFromIso(isoWeek);

    const from = this.toDateOnlyString(monday);
    const to = this.toDateOnlyString(sunday);

    const saved = await this.eventoRepo.manager.transaction(async (em) => {
      // 1) borrar esa semana
      await em.delete(EventoGlobal, { fecha: Between(from, to) });

      // 2) insertar nuevos
      const toSave: EventoGlobal[] = items.map((dto) => {
        const e = new EventoGlobal();
        e.fecha = this.getDateByDayKey(isoWeek, dto.dayKey); // YYYY-MM-DD
        e.blockCode = dto.blockCode;
        e.titulo = dto.titulo;
        e.descripcion = dto.descripcion ?? null;
        return e;
      });

      return em.save(EventoGlobal, toSave);
    });

    return saved.map((e) => this.toOutDto(e));
  }
}
