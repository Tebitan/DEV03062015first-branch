import { Injectable } from '@nestjs/common';
import { Agent, request } from 'undici';
import { IHttpProvider } from './interfaces/http-provider.interface';
import { URLSearchParams } from 'url';
import { HttpRequestOptions, HttpResponse } from '../../domain/http-client-options.dto';

@Injectable()
export class HttpProvider implements IHttpProvider {

  /**
   * Realiza una solicitud HTTP utilizando la librería Undici, manejando parámetros, encabezados, cuerpo, timeout y retorno tipado.
   * En caso de error, no lanza excepciones: retorna un objeto HttpResponse<T> con status 500 y un cuerpo de error.
   * 
   * @param options Opciones de la solicitud HTTP (método, URL, headers, query, body, timeout).
   * @returns Promise<HttpResponse<T>>
   */
  async request<T = any>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
    const { method, url, headers = {}, query, body, timeout = 5000 } = options;
    const queryString = query
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : '';
    const finalUrl = `${url}${queryString}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const agent = new Agent({ connectTimeout: timeout });
    try {
      const response = await request(finalUrl, {
        method,
        dispatcher: agent,
        headers: {
          'content-type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      const data = (await response.body.json()) as T;
      return {
        status: response.statusCode,
        data
      };
    } catch (error: any) {
       const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
       options.headers = {};
      return {
        status,
        data: {
          message: 'Error al realizar la solicitud HTTP.',
          error: error?.message || 'Unknown error',
          options,
        } as unknown as T,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
