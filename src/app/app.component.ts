import { Component } from '@angular/core';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, IonicModule],
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.initializeApp();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  async initializeApp() {
    await this.platform.ready();

    const isLoggedIn = await this.authService.isLoggedIn();
    const currentUrl = this.router.url;

    if (isLoggedIn) {
      if (currentUrl === '/login') {
        await this.presentToast('✅ Session active, redirection vers le tableau de bord...');
        this.router.navigate(['/dashboard']);
      }
    } else {
      if (currentUrl === '/dashboard') {
        await this.presentToast('🔐 Veuillez vous connecter.');
        this.router.navigate(['/login']);
      }
    }
  }
}
