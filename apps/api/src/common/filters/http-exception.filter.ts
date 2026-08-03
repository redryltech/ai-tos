import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const requestId = randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const obj = body as Record<string, unknown>;
        const msg = obj.message;
        message = Array.isArray(msg) ? msg.join(', ') : String(msg ?? exception.message);
        code = typeof obj.error === 'string' ? obj.error : HttpStatus[status] ?? code;
      }
      code = status === HttpStatus.UNAUTHORIZED ? 'UNAUTHORIZED'
        : status === HttpStatus.FORBIDDEN ? 'FORBIDDEN'
        : status === HttpStatus.BAD_REQUEST ? 'BAD_REQUEST'
        : code;
    } else {
      this.logger.error(exception);
    }

    res.status(status).json({
      data: null,
      error: { code, message, requestId },
    });
  }
}
