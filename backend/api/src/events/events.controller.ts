import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, AcknowledgeEventDto, FilterEventsDto } from './dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiKeyGuard } from './guards/api-key/api-key.guard';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Sudah global di main.ts

@Controller('api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Publish Event
   * POST /api/v1/events
   * Khusus Internal System (Pake API Key)
   */
  @UseGuards(ApiKeyGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async publishEvent(@Body() createEventDto: CreateEventDto) {
    const event = await this.eventsService.publishEvent(createEventDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Event berhasil di-publish',
      data: event,
    };
  }

  /**
   * Acknowledge Event
   * POST /api/v1/events/ack
   * Khusus Internal System (Pake API Key)
   */
  @UseGuards(ApiKeyGuard)
  @Post('ack')
  @HttpCode(HttpStatus.CREATED)
  async acknowledgeEvent(@Body() acknowledgeDto: AcknowledgeEventDto) {
    const acknowledgment =
      await this.eventsService.acknowledgeEvent(acknowledgeDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Event berhasil di-acknowledge',
      data: acknowledgment,
    };
  }

  /**
   * Get All Events (Audit Log)
   * GET /api/v1/events
   * ✅ AKSES UNTUK USER FRONTEND (Admin/Operator) - Hapus ApiKeyGuard
   */
  // @UseGuards(ApiKeyGuard) <--- HAPUS INI AGAR BISA DIAKSES FRONTEND
  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  async findAll(@Query() filterDto: FilterEventsDto) {
    const result = await this.eventsService.findAll(filterDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Events berhasil diambil',
      ...result,
    };
  }

  /**
   * Get Event Statistics
   * GET /api/v1/events/stats
   * ✅ AKSES UNTUK DASHBOARD
   */
  @Get('stats')
  @Roles('ADMIN', 'OPERATOR')
  async getStatistics() {
    const stats = await this.eventsService.getStatistics();
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistik events berhasil diambil',
      data: stats,
    };
  }

  /**
   * Get Pending Events
   * GET /api/v1/events/pending
   */
  @Get('pending')
  @Roles('ADMIN', 'OPERATOR')
  async getPendingEvents() {
    const events = await this.eventsService.getPendingEvents();
    return {
      statusCode: HttpStatus.OK,
      message: 'Pending events berhasil diambil',
      data: events,
      total: events.length,
    };
  }

  /**
   * Get Event by ID
   * GET /api/v1/events/:id
   */
  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const event = await this.eventsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Event berhasil diambil',
      data: event,
    };
  }
}