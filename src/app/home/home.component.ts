import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private router: Router, private authService: AuthService) {}

  async commencer() {
    const isLoggedIn = await this.authService.isLoggedIn();

    if (isLoggedIn) {
      const user = await this.authService.getCurrentUser();
      const roles = user?.roles || [];

      if (roles.includes('petowner')) {
        this.router.navigate(['/dashboard']);
      } else if (roles.includes('petsitter')) {
        this.router.navigate(['/dashboard-sitter']);
      } else {
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
