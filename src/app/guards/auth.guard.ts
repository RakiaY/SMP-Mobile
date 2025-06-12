import { Injectable } from "@angular/core"
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router"
import { AuthService } from "../services/auth.service"
import { ToastController } from "@ionic/angular"

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    console.log("AuthGuard: Checking authentication for route:", state.url)

    // Check if user is authenticated
    const isLoggedIn = await this.authService.isLoggedIn()
    console.log("AuthGuard: Is logged in:", isLoggedIn)

    if (!isLoggedIn) {
      console.log("AuthGuard: User not authenticated, redirecting to login")
      this.presentToast("Veuillez vous connecter pour accéder à cette page", "warning")
      this.router.navigate(["/login"])
      return false
    }

    // Check if we have user data
    const user = await this.authService.getCurrentUser()
    console.log("AuthGuard: Current user:", user)

    if (!user) {
      console.log("AuthGuard: No user data found, redirecting to login")
      this.presentToast("Session expirée, veuillez vous reconnecter", "warning")
      await this.authService.logout()
      return false
    }

    // Simplified token validation since we don't have /user endpoint
    try {
      const isTokenValid = await this.authService.checkTokenValidity().toPromise()
      console.log("AuthGuard: Token valid:", isTokenValid)

      if (!isTokenValid) {
        console.log("AuthGuard: Token invalid, redirecting to login")
        this.presentToast("Session expirée, veuillez vous reconnecter", "warning")
        await this.authService.logout()
        return false
      }
    } catch (error) {
      console.error("AuthGuard: Error checking token validity:", error)
      // Don't fail the guard for token validation errors, just log them
      console.log("AuthGuard: Continuing despite token validation error")
    }

    console.log("AuthGuard: Authentication successful")
    return true
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: "bottom",
    })
    await toast.present()
  }
}
