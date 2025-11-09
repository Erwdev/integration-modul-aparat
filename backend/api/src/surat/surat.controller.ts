import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SuratService } from './surat.service';
import { CreateSuratDto } from './dto/create-surat.dto';
import { UpdateSuratDto } from './dto/update-surat.dto';
import { UpdateStatusSuratDto } from './dto/update-status-surat.dto';
import { QuerySuratDto } from './dto/filter-surat.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  SuratResponseDto,
  PaginatedSuratResponseDto,
} from './dto/response-surat.dto';

@Controller('api/v1/surat')
// @UseGuards(JwtAuthGuard) // Uncomment when JWT is ready
export class SuratController {
  private readonly logger = new Logger(SuratController.name);

  constructor(private readonly suratService: SuratService) {}

  /**
   * POST /api/v1/surat
   * Membuat surat baru
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSuratDto: CreateSuratDto,
    @CurrentUser('id') userId?: string,
  ): Promise<SuratResponseDto> {
    this.logger.log(`POST /surat - Creating surat: ${createSuratDto.perihal}`);

    const surat = await this.suratService.create(createSuratDto, userId);

    return surat;
  }

  /**
   * GET /api/v1/surat/:id
   * Mengambil detail surat by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuratResponseDto> {
    this.logger.log(`GET /surat/${id} - Fetching surat detail`);

    const surat = await this.suratService.findOne(id);

    return surat;
  }

  /**
   * GET /api/v1/surat
   * Mengambil list surat dengan filtering dan pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QuerySuratDto,
  ): Promise<PaginatedSuratResponseDto> {
    this.logger.log(
      `GET /surat - Query: page=${query.page}, limit=${query.limit}`,
    );

    const result = await this.suratService.findAll(query);

    return result;
  }

  /**
   * PUT /api/v1/surat/:id
   * Update surat (hanya DRAFT)
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSuratDto: UpdateSuratDto,
    @Headers('if-match') etag?: string,
    @CurrentUser('id') userId?: string,
  ): Promise<SuratResponseDto> {
    this.logger.log(`PUT /surat/${id} - Updating surat`);

    const surat = await this.suratService.update(
      id,
      updateSuratDto,
      userId,
      etag,
    );

    return surat;
  }

  /**
   * PATCH /api/v1/surat/:id/status
   * Update status surat
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateStatusSuratDto,
    @CurrentUser('id') userId?: string,
  ): Promise<SuratResponseDto> {
    this.logger.log(
      `PATCH /surat/${id}/status - Updating to ${updateStatusDto.status}`,
    );

    const surat = await this.suratService.updateStatus(
      id,
      updateStatusDto,
      userId,
    );

    return surat;
  }

  /**
   * DELETE /api/v1/surat/:id
   * Soft delete surat (hanya DRAFT)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId?: string,
  ): Promise<void> {
    this.logger.log(`DELETE /surat/${id} - Soft deleting surat`);

    await this.suratService.remove(id, userId);
  }

  /**
   * GET /api/v1/surat/statistics
   * Get surat statistics
   */
  @Get('statistics/summary')
  @HttpCode(HttpStatus.OK)
  async getStatistics(): Promise<any> {
    this.logger.log('GET /surat/statistics - Fetching statistics');

    const stats = await this.suratService.getStatistics();

    return {
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }
}