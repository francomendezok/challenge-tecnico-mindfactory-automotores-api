import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: Record<string, unknown> = { statusCode: status };

    if (exception instanceof HttpException) {
      const raw = exception.getResponse();
      if (typeof raw === 'string') {
        body.message = raw;
      } else if (typeof raw === 'object' && raw !== null) {
        const obj = raw as Record<string, unknown>;
        if (typeof obj.message === 'string') {
          body.message = obj.message;
        } else if (Array.isArray(obj.message)) {
          body.message = obj.message;
        }
        if (obj.errors !== undefined) {
          body.errors = obj.errors;
        }
        if (body.message === undefined) {
          body.message = raw;
        }
      } else {
        body.message = raw;
      }
    } else {
      body.message = 'Internal server error';
    }

    response.status(status).json(body);
  }
}
