import { Injectable } from "@angular/core"
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router"
import { Storage } from "@ionic/storage-angular"
import { ToastController } from "@ionic/angular"
import { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  private isRedirecting = false // Prevent infinite loops

  constructor(
    private storage: Storage,
    private router: Router,
    private toastCtrl: ToastController,
    private authService: AuthService,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    // Prevent infinite loops
    if (this.isRedirecting) {
      console.log("RoleGuard: Already redirecting, allowing access")
      return true
    }

    console.log("RoleGuard: Starting role check for route:", state.url)

    await this.storage.create()

    // First, try to get user from AuthService BehaviorSubject (faster)
    let user = this.authService.getCurrentUserSync()

    // If not available, wait for it to be loaded
    if (!user) {
      console.log("RoleGuard: User not immediately available, waiting...")
      user = await this.authService.waitForUserData(3000) // Wait up to 3 seconds
    }

    // If still no user, try storage directly as final fallback
    if (!user) {
      console.log("RoleGuard: Trying storage as fallback")
      user = await this.storage.get("current_user")
    }

    // If no user, redirect to login
    if (!user) {
      console.log("RoleGuard: No user found, redirecting to login")
      this.presentToast("Veuillez vous connecter pour accéder à cette page", "warning")
      this.redirectTo("/login")
      return false
    }

    console.log("RoleGuard: User found:", user)
    console.log("RoleGuard: User roles:", user.roles)

    // Get required roles from route data
    const requiredRoles = route.data["roles"] as Array<string>
    console.log("RoleGuard: Required roles for route:", requiredRoles)

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log("RoleGuard: No roles required, allowing access")
      return true
    }

    // Check if user has any of the required roles
    const hasRole = this.checkUserHasRole(user.roles, requiredRoles)

    console.log("RoleGuard: Has required role:", hasRole)

    if (!hasRole) {
      this.presentToast("Vous n'avez pas les permissions nécessaires", "danger")

      // Redirect based on user role to prevent infinite loops
      this.redirectBasedOnUserRole(user.roles)
      return false
    }

    console.log("RoleGuard: Access granted")
    return true
  }

  private checkUserHasRole(userRoles: string[], requiredRoles: string[]): boolean {
    if (!userRoles || userRoles.length === 0) {
      console.log("RoleGuard: User has no roles")
      return false
    }

    return requiredRoles.some((requiredRole) => {
      console.log(`RoleGuard: Checking if user has role: ${requiredRole}`)

      // Check each user role against the required role
      return userRoles.some((userRole) => {
        console.log(`RoleGuard: Comparing user role '${userRole}' with required role '${requiredRole}'`)

        // Direct match
        if (userRole === requiredRole) {
          console.log(`RoleGuard: ✅ Direct match: ${userRole} === ${requiredRole}`)
          return true
        }

        // Convert underscores to no underscores and vice versa
        const userRoleNoUnderscore = userRole.replace(/_/g, "")
        const requiredRoleNoUnderscore = requiredRole.replace(/_/g, "")

        if (userRoleNoUnderscore === requiredRoleNoUnderscore) {
          console.log(
            `RoleGuard: ✅ Match without underscores: ${userRoleNoUnderscore} === ${requiredRoleNoUnderscore}`,
          )
          return true
        }

        // Check petsitter vs pet_sitter specifically
        if (
          (userRole === "petsitter" && requiredRole === "pet_sitter") ||
          (userRole === "pet_sitter" && requiredRole === "petsitter")
        ) {
          console.log(`RoleGuard: ✅ Pet sitter role match: ${userRole} <-> ${requiredRole}`)
          return true
        }

        // Check petowner vs pet_owner specifically
        if (
          (userRole === "petowner" && requiredRole === "pet_owner") ||
          (userRole === "pet_owner" && requiredRole === "petowner")
        ) {
          console.log(`RoleGuard: ✅ Pet owner role match: ${userRole} <-> ${requiredRole}`)
          return true
        }

        // Check with/without "pet_" prefix
        if (requiredRole.startsWith("pet_") && userRole === requiredRole.substring(4)) {
          console.log(`RoleGuard: ✅ Match without pet_ prefix: ${userRole} === ${requiredRole.substring(4)}`)
          return true
        }

        if (!requiredRole.startsWith("pet_") && userRole === `pet_${requiredRole}`) {
          console.log(`RoleGuard: ✅ Match with pet_ prefix: ${userRole} === pet_${requiredRole}`)
          return true
        }

        // Check singular/plural variations
        if (requiredRole.endsWith("s") && userRole === requiredRole.slice(0, -1)) {
          console.log(`RoleGuard: ✅ Singular match: ${userRole} === ${requiredRole.slice(0, -1)}`)
          return true
        }

        if (!requiredRole.endsWith("s") && userRole === `${requiredRole}s`) {
          console.log(`RoleGuard: ✅ Plural match: ${userRole} === ${requiredRole}s`)
          return true
        }

        console.log(`RoleGuard: ❌ No match: ${userRole} !== ${requiredRole}`)
        return false
      })
    })
  }

  private redirectBasedOnUserRole(userRoles: string[]): void {
    if (!userRoles || userRoles.length === 0) {
      this.redirectTo("/login")
      return
    }

    // Check if user is a pet sitter
    const isPetSitter = userRoles.some((role) => ["petsitter", "pet_sitter", "sitter"].includes(role.toLowerCase()))

    // Check if user is a pet owner
    const isPetOwner = userRoles.some((role) => ["petowner", "pet_owner", "owner"].includes(role.toLowerCase()))

    if (isPetSitter) {
      this.redirectTo("/dashboard-sitter")
    } else if (isPetOwner) {
      this.redirectTo("/dashboard")
    } else {
      this.redirectTo("/home")
    }
  }

  private redirectTo(path: string): void {
    this.isRedirecting = true
    this.router.navigate([path]).then(() => {
      // Reset the flag after navigation completes
      setTimeout(() => {
        this.isRedirecting = false
      }, 1000)
    })
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: "bottom",
    })
    await toast.present()
  }
}
