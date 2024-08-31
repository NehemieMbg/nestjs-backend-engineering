import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

/**
 * Interface representing a class constructor.
 * Ensures that the type is a class with a constructor.
 */
interface ClassConstructor {
  new (...args: any[]): NonNullable<unknown>; // any class
}

/**
 * Decorator that specifies the DTO class to use for transforming the response data.
 * @param dto - DTO class to use for transforming the response data.
 * @returns Decorator that specifies the DTO class to use for transforming the response data.
 */
export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

/**
 * Interceptor class that transforms the response data to an instance of the specified DTO class.
 */
export class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly dto: any) {}

  /**
   * Intercepts the request and transforms the response data to an instance of the specified DTO class.
   * @param context - ExecutionContext object containing the request and response objects.
   * @param next - CallHandler object that represents the next handler in the chain.
   * @returns Observable that emits the transformed response data as an instance of the specified DTO class.
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // * Run code before a request is handled by the request handler

    return next.handle().pipe(
      map((data: any) => {
        //* Run something before the response is sent out

        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
