import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const loggedIn = await this.authService.isLoggedIn();
    if (loggedIn) {
      this.router.navigate(['/dashboard']); // ou autre page d'accueil après login
      return false;
    }
    return true;
  }
}
