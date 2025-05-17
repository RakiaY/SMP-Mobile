import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, IonicModule], // ✅ le bon import ici
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) { this.initializeApp(); }

  async initializeApp() {
    await this.platform.ready();

    const isLoggedIn = await this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.presentToast('✅ Session active, redirection vers le tableau de bord...');
      this.router.navigate(['/dashboard']);
    } else {
      this.presentToast('🔐 Veuillez vous connecter.');
      this.router.navigate(['/login']);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
