// src/modules/eventos-globales/eventos-globales.controller.ts
import {
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

@UseGuards(JwtAuthGuard)
@Controller('eventos-globales')
export class EventosGlobalesController {
  constructor(
    private readonly eventosGlobalesService: EventosGlobalesService,
  ) {}

  // GET /eventos-globales/semana/2025-W10
  @Get('semana/:isoWeek')
  getByWeek(@Param('isoWeek') isoWeek: string) {
    return this.eventosGlobalesService.getByWeek(isoWeek);
  }

  // PUT /eventos-globales/semana/2025-W10
  // Body: GlobalEventDto[]
  @Put('semana/:isoWeek')
  replaceForWeek(
    @Param('isoWeek') isoWeek: string,
    @Body() items: GlobalEventDto[],
  ) {
    return this.eventosGlobalesService.replaceForWeek(isoWeek, items);
  }
}
