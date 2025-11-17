import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message || 'An error occurred';
        errors = (exceptionResponse as any).errors || null;
      } else {
        message = exception.message || 'An error occurred';
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      errors = process.env.NODE_ENV !== 'production' ? { database: exception.message } : null;
    } else if (exception instanceof Error) {
      message = exception.message || 'An error occurred';
    }

    const errorResponse = {
      message,
      ...(errors && { errors }),
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
      'AllExceptionsFilter',
    );

    response.status(status).json(errorResponse);
  }
}