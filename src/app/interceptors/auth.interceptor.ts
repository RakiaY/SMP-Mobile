import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private storage: Storage) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.storage.get('auth_token')).pipe(
      switchMap(token => {
        const isForm = req.body instanceof FormData;

        const headersConfig: Record<string,string> = {
          'Accept': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        };

        // only set JSON Content-Type if NOT a FormData
        if (!isForm) {
          headersConfig['Content-Type'] = 'application/json';
        }

        const cloned = req.clone({ setHeaders: headersConfig });
        return next.handle(cloned);
      })
    );
  }
}
