// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouteReuseStrategy }         from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicStorageModule }          from '@ionic/storage-angular';

import { AppComponent }               from './app/app.component';
import { routes }                     from './app/app.routes';
import { AuthInterceptor }            from './app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // installe le client HTTP et scanne automatiquement tous les interceptors fournis en DI
    provideHttpClient(withInterceptorsFromDi()),

    // il faut quand même déclarer ton AuthInterceptor…
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    importProvidersFrom(IonicStorageModule.forRoot()),
  ],
});
