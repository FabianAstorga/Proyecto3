// src/modules/eventos-globales/eventos-globales.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventosGlobalesService } from './eventos-globales.service';
import { GlobalEventDto } from './dto/global-event.dto';
import { GlobalEventOutDto } from './dto/global-event-out.dto';

@UseGuards(JwtAuthGuard)
@Controller('eventos-globales')
export class EventosGlobalesController {
  constructor(
    private readonly eventosGlobalesService: EventosGlobalesService,
  ) {}

  private assertIsoWeek(isoWeek: string) {
    if (!/^\d{4}-W\d{2}$/.test(isoWeek)) {
      throw new BadRequestException(
        'isoWeek inválido. Use formato YYYY-Www (ej: 2025-W10)',
      );
    }
  }

  // GET /eventos-globales/semana/2025-W10
  @Get('semana/:isoWeek')
  getByWeek(@Param('isoWeek') isoWeek: string): Promise<GlobalEventOutDto[]> {
    this.assertIsoWeek(isoWeek);
    return this.eventosGlobalesService.getByWeek(isoWeek);
  }

  // PUT /eventos-globales/semana/2025-W10
  @Put('semana/:isoWeek')
  replaceForWeek(
    @Param('isoWeek') isoWeek: string,
    @Body() items: GlobalEventDto[],
  ): Promise<GlobalEventOutDto[]> {
    this.assertIsoWeek(isoWeek);
    return this.eventosGlobalesService.replaceForWeek(isoWeek, items);
  }
}
