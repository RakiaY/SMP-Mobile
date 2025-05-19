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
        console.log('🔐 Interceptor token:', token); // 👈 Log the token being used

        if (token) {
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });

          console.log('➡️ Request with auth header:', cloned); // 👈 Log the final request
          return next.handle(cloned);
        }

        console.warn('🚫 No token found in storage.');
        return next.handle(req);
      })
    );
  }
}
