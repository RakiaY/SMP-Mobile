// src/app/app.component.ts

import { Component }       from '@angular/core';
import {
  IonicModule,
  ToastController,
  Platform
}                          from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

import { AuthService }      from './services/auth.service';
import { EchoService }      from './services/echo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterModule, IonicModule ],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  private notificationCount = 0;

  constructor(
    private platform:       Platform,
    private authService:    AuthService,
    private echoService:    EchoService,
    private router:         Router,
    private toastController: ToastController
  ) {
    this.initializeApp();
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  private async initializeApp() {
    await this.platform.ready();

    // 1) Perform your existing login check / redirect
    const isLoggedIn = await this.authService.isLoggedIn();
    const currentUrl = this.router.url;
    if (isLoggedIn && currentUrl === '/login') {
      await this.presentToast('✅ Session active, redirection vers le tableau de bord...');
      this.router.navigate(['/dashboard']);
    }
    if (!isLoggedIn && currentUrl === '/dashboard') {
      await this.presentToast('🔐 Veuillez vous connecter.');
      this.router.navigate(['/login']);
    }

    // 2) Once the platform is ready and user is logged in, start notifications
    if (isLoggedIn) {
      this.initNotificationListener();
    }
  }

  private async initNotificationListener() {
    // Load the current user (so we know their ID)
    const user = await this.authService.getCurrentUser();
    if (!user?.id) {
      return;
    }

    // Subscribe to the private notifications.{id} channel
    this.echoService.echo
      .private(`notifications.${user.id}`)
      .listen('NewMessageNotification', (payload: any) => {
        // Increment your badge count (if you show one)
        this.notificationCount++;

        // Show a toast with the message body
        this.presentToast(`Nouveau message: ${payload.message}`);
      });
  }
}
