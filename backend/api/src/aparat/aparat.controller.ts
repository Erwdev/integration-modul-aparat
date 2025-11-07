import {
  Controller, Get, Post, Body, Param, Put, Delete, Query, Patch, Res, Req, UploadedFile, UseInterceptors, HttpCode, HttpStatus
} from '@nestjs/common';
import { AparatService } from './aparat.service';
import { CreateAparatDto } from './dto/create-aparat.dto';
import { UpdateAparatDto } from './dto/update-aparat.dto';
import { FilterAparatDto } from './dto/filter-aparat.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import type { Response, Request } from 'express';
import * as path from 'path';

@Controller('api/v1/aparat')
export class AparatController {
  constructor(private readonly service: AparatService) {}

  @Post()
  create(@Body() dto: CreateAparatDto) {
    return this.service.create(dto);
  }

  // Upload tanda tangan: returns { tanda_tangan_url: ... }
  @Post('upload-signature')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/signatures',
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowed = ['.png','.jpg','.jpeg'];
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, allowed.includes(ext));
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  }))
  uploadSignature(@UploadedFile() file) {
    // You may need to adjust base URL depending on deployment
    const url = `${process.env.BASE_URL ?? 'http://localhost:3000'}/uploads/signatures/${file.filename}`;
    return { tanda_tangan_url: url };
  }

  @Get()
  findAll(@Query() filter: FilterAparatDto) {
    return this.service.findAll(filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const item = await this.service.findOne(id);
    
    // ✅ Pastikan serialisasi konsisten dengan sorting keys
    const bodyStr = JSON.stringify(item, Object.keys(item).sort());
    const etag = `"${createHash('md5').update(bodyStr).digest('hex')}"`;

    // Pengecekan If-None-Match
    const clientETag = req.headers['if-none-match'];
    if (clientETag === etag) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('ETag', etag);
      return res.status(304).send();
    }

    // Set header caching
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('ETag', etag);

    return res.json(item);
  }


  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAparatDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  patchStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.patchStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
