import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    GatewayTimeoutException,
} from '@nestjs/common';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    constructor(private readonly timeoutMs: number) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            timeout(this.timeoutMs),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    return throwError(() => new GatewayTimeoutException(`Tiempo de espera (${this.timeoutMs}ms) superado.`));
                }
                return throwError(() => err);
            }),
        );
    }
}
