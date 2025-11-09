import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { EkspedisiService } from './ekspedisi.service';
import { CreateEkspedisiDto } from './dto/create-ekspedisi.dto';
import { UpdateEkspedisiDto } from './dto/update-ekspedisi.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateStatusDto } from './dto/update-status.dto'; 
import { UploadBuktiTerimaDto } from './dto/upload-bukti-terima.dto';
import { StatusEkspedisi } from './enums/status-ekspedisi.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';  
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

const buktiTerimaStorage = diskStorage({
  destination: './uploads/bukti-terima',
  filename: (req, file, cb) => {
    const uniqueSuffix =  Date.now() + '_' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `bukti-${uniqueSuffix}${ext}`);
  }
})

@ApiTags('ekspedisi')
@ApiBearerAuth()
@Controller('api/v1/ekspedisi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EkspedisiController {
  constructor(private readonly ekspedisiService: EkspedisiService) {}

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Buat ekspedisi baru' })
  @ApiResponse({ status: 201, description: 'Ekspedisi berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Data tidak valid' })
  @ApiResponse({ status: 404, description: 'Surat tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'Nomor resi sudah digunakan' })
  async create(@Body() dto: CreateEkspedisiDto) {
    return this.ekspedisiService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'STAFF', 'VIEWER')
  @ApiOperation({ summary: 'Get semua ekspedisi dengan pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Data ekspedisi berhasil diambil' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ekspedisiService.findAll(page, limit);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF', 'VIEWER')
  @ApiOperation({ summary: 'Get detail ekspedisi' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Detail ekspedisi berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Ekspedisi tidak ditemukan' })
  async findOne(@Param('id') id: string) {
    return this.ekspedisiService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Update ekspedisi' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Ekspedisi berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Ekspedisi tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'Nomor resi sudah digunakan' })
  async update(@Param('id') id: string, @Body() dto: UpdateEkspedisiDto) {
    return this.ekspedisiService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Update status ekspedisi' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(StatusEkspedisi),
          description: 'Status baru ekspedisi',
        },
        catatan: {
          type: 'string',
          nullable: true,
          description: 'Catatan perubahan status (opsional)',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Status berhasil diupdate' })
  @ApiResponse({ status: 400, description: 'Status transition tidak valid' })
  @ApiResponse({ status: 404, description: 'Ekspedisi tidak ditemukan' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ekspedisiService.updateStatus(id, dto.status, dto.catatan);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Hapus ekspedisi' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Ekspedisi berhasil dihapus' })
  @ApiResponse({ status: 400, description: 'Ekspedisi tidak dapat dihapus (sudah terkirim)' })
  @ApiResponse({ status: 404, description: 'Ekspedisi tidak ditemukan' })
  async remove(@Param('id') id: string) {
    return this.ekspedisiService.remove(id);
  }


  @Post(':id/upload-bukti')
  @Roles('ADMIN', 'STAFF')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: buktiTerimaStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          return cb(
            new BadRequestException('Only image and PDF files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Upload bukti terima pengiriman' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File bukti terima (JPG, PNG, PDF, max 5MB)',
        },
        namaPenerima: {
          type: 'string',
          description: 'Nama penerima surat',
        },
      },
      required: ['file', 'namaPenerima'],
    },
  })
  @ApiResponse({ status: 200, description: 'Bukti terima berhasil diupload' })
  @ApiResponse({ status: 400, description: 'File tidak valid atau ekspedisi sudah terkirim' })
  @ApiResponse({ status: 404, description: 'Ekspedisi tidak ditemukan' })
  async uploadBuktiTerima(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('namaPenerima') namaPenerima: string,
  ) {
    if (!file) {
      throw new BadRequestException('File bukti terima harus diupload');
    }

    if (!namaPenerima || namaPenerima.trim() === '') {
      throw new BadRequestException('Nama penerima tidak boleh kosong');
    }

    return this.ekspedisiService.uploadBuktiTerima(id, file, namaPenerima.trim());
  }
}
