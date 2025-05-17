import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http'; 
import { IonicStorageModule } from '@ionic/storage-angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
<<<<<<< HEAD
=======
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { AuthService } from './app/services/auth.service';
>>>>>>> 768108165bcaf9c1a831d734d5fc890870c3af5b

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
     provideHttpClient() ,
     importProvidersFrom(IonicStorageModule.forRoot()),
  ],
});