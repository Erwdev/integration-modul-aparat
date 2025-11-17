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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
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
import * as fs from 'fs';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024;

const MAGIC_BYTES = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff, 0xe0], // JPEG/JFIF
    [0xff, 0xd8, 0xff, 0xe1], // JPEG/Exif
    [0xff, 0xd8, 0xff, 0xe2], // JPEG
    [0xff, 0xd8, 0xff, 0xe3], // JPEG
  ],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]], // PNG
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // PDF (%PDF)
};

function validateMagicBytes(filepath: string, mimetype: string): boolean {
  try {
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filepath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    const signatures = MAGIC_BYTES[mimetype];
    if (!signatures) return false;

    return signatures.some((signature) => {
      return signature.every((byte, index) => buffer[index] === byte);
    });
  } catch (error) {
    return false;
  }
}

const buktiTerimaStorage = diskStorage({
  destination: './uploads/bukti-terima',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
    // Sanitize filename to prevent directory traversal
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = extname(sanitizedName);
    cb(null, `bukti-${uniqueSuffix}${ext}`);
  },
});

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
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.ekspedisiService.findAll(page, limit);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF', 'VIEWER')
  @ApiOperation({ summary: 'Get detail ekspedisi' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Detail ekspedisi berhasil diambil',
  })
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
  @ApiResponse({
    status: 400,
    description: 'Ekspedisi tidak dapat dihapus (sudah terkirim)',
  })
  @ApiResponse({ status: 404, description: 'Ekspedisi tidak ditemukan' })
  async remove(@Param('id') id: string) {
    return this.ekspedisiService.remove(id);
  }

  @Post(':id/upload-bukti')
  @Roles('ADMIN', 'STAFF')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: buktiTerimaStorage,
      limits: {
        fileSize: MAX_SIZE,
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        // Check MIME type
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Tipe file tidak valid. Tipe yang diizinkan: ${ALLOWED_MIMES.join(', ')}`,
            ),
            false,
          );
        }

        // Check extension matches MIME type
        const ext = extname(file.originalname).toLowerCase();
        const mimeToExt = {
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'application/pdf': ['.pdf'],
        };

        const allowedExts = mimeToExt[file.mimetype] || [];
        if (!allowedExts.includes(ext)) {
          return cb(
            new BadRequestException(
              'Ekstensi file tidak sesuai dengan tipe MIME',
            ),
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

    // Validate magic bytes to prevent MIME type spoofing
    const isValidFile = validateMagicBytes(file.path, file.mimetype);
    if (!isValidFile) {
      // Delete uploaded file if validation fails
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error deleting invalid file:', error);
      }
      throw new BadRequestException(
        'File tidak valid. Tipe file tidak sesuai dengan konten file.'
      );
    }

    return this.ekspedisiService.uploadBuktiTerima(id, file, namaPenerima.trim());
  }

}
