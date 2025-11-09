import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DeadLetterQueueService } from '../services/dead-letter-queue.service';
import { EventTopic } from '../enums';

@Controller('api/v1/events/dlq')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') // Only admins can manage DLQ
export class DeadLetterQueueController {
  constructor(private readonly dlqService: DeadLetterQueueService) {}

  /**
   * GET /api/v1/events/dlq - Get all DLQ events
   */
  @Get()
  async getDeadLetterQueue(
    @Query('topic') topic?: string,
    @Query('source_module') source_module?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const result = await this.dlqService.getDeadLetterQueue({
      topic,
      source_module,
      limit,
      offset,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Dead Letter Queue events retrieved',
      ...result,
    };
  }

  /**
   * GET /api/v1/events/dlq/statistics - Get DLQ statistics
   */
  @Get('statistics')
  async getStatistics() {
    const stats = await this.dlqService.getStats();

    return {
      statusCode: HttpStatus.OK,
      message: 'DLQ statistics retrieved',
      data: stats,
    };
  }

  /**
   * POST /api/v1/events/dlq/:id/retry - Retry event from DLQ
   */
  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  async retryFromDLQ(@Param('id') id: string) {
    const event = await this.dlqService.retryFromDeadLetterQueue(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Event moved from DLQ and queued for retry',
      data: event,
    };
  }

  /**
   * POST /api/v1/events/dlq/retry-topic - Bulk retry by topic
   */
  // type of the topic is string for query parameter
  @Post('retry-topic')
  @HttpCode(HttpStatus.OK)
  async bulkRetryByTopic(@Query('topic') topic: string) {
    if( !topic || !Object.values(EventTopic).includes(topic as EventTopic)) {
        throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid topic',
            error: `Topic must be one of : ${Object.values(EventTopic).join(', ')}`,
            valid_topics : Object.values(EventTopic),
        })
    }

    const count = await this.dlqService.bulkRetryByTopic(topic as EventTopic );

    return {
      statusCode: HttpStatus.OK,
      message: `${count} events moved from DLQ for retry`,
      data: { count, topic },
    };

  }

  /**
   * DELETE /api/v1/events/dlq/:id - Delete event from DLQ permanently
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFromDLQ(@Param('id') id: string) {
    await this.dlqService.deleteFromDeadLetterQueue(id);
  }
}