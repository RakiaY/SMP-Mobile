import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable, from, throwError, of, BehaviorSubject } from "rxjs"
import { switchMap, catchError } from "rxjs/operators"
import { Storage } from "@ionic/storage-angular"
import { ErrorHandlerService } from "./error-handler.service"
import { Router } from "@angular/router"

const baseUrl = "http://localhost:8000/api/"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private storageInitialized = false
  private userSubject = new BehaviorSubject<any>(null)
  private tokenSubject = new BehaviorSubject<string | null>(null)

  // Observable streams for components to subscribe to
  public user$ = this.userSubject.asObservable()
  public token$ = this.tokenSubject.asObservable()

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private errorHandler: ErrorHandlerService,
    private router: Router,
  ) {
    this.initStorage()
  }

  private async initStorage() {
    if (!this.storageInitialized) {
      await this.storage.create()
      this.storageInitialized = true

      // Load existing data from storage
      const existingToken = await this.storage.get("auth_token")
      const existingUser = await this.storage.get("current_user")

      if (existingToken) {
        this.tokenSubject.next(existingToken)
      }

      if (existingUser) {
        // Ensure roles is always an array
        if (existingUser.roles && !Array.isArray(existingUser.roles)) {
          if (typeof existingUser.roles === "string") {
            existingUser.roles = [existingUser.roles]
          } else {
            existingUser.roles = []
          }
        }
        this.userSubject.next(existingUser)
      }
    }
  }

  loginUser(loginData: any): Observable<any> {
    return this.http.post(baseUrl + "user/login", loginData).pipe(
      switchMap((response: any) =>
        from(
          (async () => {
            await this.initStorage()

            console.log("Login response:", response)

            // Check for pending status first
            if (response?.user_information?.status === "Pending") {
              throw new Error("PENDING_APPROVAL")
            }

            // Check for inactive/blocked status
            if (response?.user_information?.status === "Inactive") {
              throw new Error("ACCOUNT_INACTIVE")
            }

            // Process and save token
            if (response?.token) {
              await this.storage.set("auth_token", response.token)
              this.tokenSubject.next(response.token)
              console.log("Token saved to storage")
            }

            // Process and save user information
            if (response?.user_information) {
              // Ensure roles is always an array
              if (response.user_information.roles && !Array.isArray(response.user_information.roles)) {
                if (typeof response.user_information.roles === "string") {
                  response.user_information.roles = [response.user_information.roles]
                } else {
                  response.user_information.roles = []
                }
              }

              console.log("User information from login:", response.user_information)

              // Save to storage AND update BehaviorSubject
              await this.storage.set("current_user", response.user_information)
              this.userSubject.next(response.user_information)
              console.log("User data saved to storage and BehaviorSubject updated")
            }

            // Add a small delay to ensure storage operations are complete
            await new Promise((resolve) => setTimeout(resolve, 100))

            return response
          })(),
        ),
      ),
      catchError((error: any) => {
        console.error("Login error:", error)

        // Handle custom errors
        if (error.message === "PENDING_APPROVAL") {
          return throwError(() => ({
            type: "PENDING_APPROVAL",
            message: "Votre compte est en attente d'approbation par un administrateur.",
          }))
        }

        if (error.message === "ACCOUNT_INACTIVE") {
          return throwError(() => ({
            type: "ACCOUNT_INACTIVE",
            message: "Votre compte a été désactivé. Contactez l'administration.",
          }))
        }

        // Handle HTTP errors
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            return throwError(() => ({
              type: "INVALID_CREDENTIALS",
              message: "Email ou mot de passe incorrect",
            }))
          } else if (error.status === 403) {
            // Check if it's a pending status from backend
            if (error.error?.status === "Pending") {
              return throwError(() => ({
                type: "PENDING_APPROVAL",
                message: error.error.message || "Votre compte est en attente d'approbation.",
              }))
            }
            return throwError(() => ({
              type: "ACCOUNT_INACTIVE",
              message: "Votre compte est désactivé ou en attente de validation",
            }))
          } else if (error.status === 429) {
            return throwError(() => ({
              type: "TOO_MANY_ATTEMPTS",
              message: "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
            }))
          }
        }

        // Use the global error handler for other errors
        return this.errorHandler.handleError(error)
      }),
    )
  }

  checkAccountStatus(email: string): Observable<any> {
    return this.http.post<any>(baseUrl + "check-account-status", { email }).pipe(
      catchError((error) => {
        return of({
          success: false,
          message: error.error?.message || "Impossible de vérifier le statut du compte",
        })
      }),
    )
  }

  registerOwner(ownerData: any): Observable<any> {
    return this.http.post(baseUrl + "registerpetowner", ownerData).pipe(
      switchMap((response: any) =>
        from(
          (async () => {
            await this.initStorage()

            if (response?.token) {
              await this.storage.set("auth_token", response.token)
              this.tokenSubject.next(response.token)
              console.log("Registration: Token saved")
            }

            if (response?.user_information) {
              // Ensure roles is always an array
              if (response.user_information.roles && !Array.isArray(response.user_information.roles)) {
                if (typeof response.user_information.roles === "string") {
                  response.user_information.roles = [response.user_information.roles]
                } else {
                  response.user_information.roles = []
                }
              }

              await this.storage.set("current_user", response.user_information)
              this.userSubject.next(response.user_information)
              console.log("Registration: User data saved")
            }

            // Add delay to ensure storage operations are complete
            await new Promise((resolve) => setTimeout(resolve, 100))

            return response
          })(),
        ),
      ),
      catchError((error: HttpErrorResponse) => {
        // Handle specific registration errors
        if (error.status === 422 && error.error?.errors?.email) {
          return throwError(() => new Error("Cette adresse email est déjà utilisée"))
        }

        // Use the global error handler for other errors
        return this.errorHandler.handleError(error)
      }),
    )
  }

  async getToken(): Promise<string | null> {
    await this.initStorage()

    // Try to get from BehaviorSubject first (faster)
    const currentToken = this.tokenSubject.value
    if (currentToken) {
      return currentToken
    }

    // Fallback to storage
    const storageToken = await this.storage.get("auth_token")
    if (storageToken) {
      this.tokenSubject.next(storageToken)
    }

    return storageToken
  }

  async isLoggedIn(): Promise<boolean> {
    await this.initStorage()

    // Check BehaviorSubject first
    if (this.tokenSubject.value) {
      return true
    }

    // Check storage as fallback
    const token = await this.storage.get("auth_token")
    console.log("Vérification token:", token)

    if (token) {
      this.tokenSubject.next(token)
      return true
    }

    return false
  }

  // Synchronous version for guards
  isAuthenticated(): boolean {
    return !!this.tokenSubject.value
  }

  async logout(): Promise<void> {
    try {
      // Try to call logout endpoint if user is connected
      const token = await this.getToken()
      if (token) {
        // Use the correct Laravel logout endpoint
        await this.http.post(baseUrl + "user/logout", {}).toPromise()
      }
    } catch (error) {
      console.error("Error during logout API call:", error)
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local storage and BehaviorSubjects
      await this.initStorage()
      await this.storage.remove("auth_token")
      await this.storage.remove("current_user")

      // Clear BehaviorSubjects
      this.tokenSubject.next(null)
      this.userSubject.next(null)

      this.router.navigate(["/login"])
    }
  }

  async getCurrentUser(): Promise<any> {
    await this.initStorage()

    // Try to get from BehaviorSubject first (faster and more reliable)
    const currentUser = this.userSubject.value
    if (currentUser) {
      return currentUser
    }

    // Fallback to storage
    const user = await this.storage.get("current_user")

    // Ensure roles is always an array
    if (user && user.roles && !Array.isArray(user.roles)) {
      if (typeof user.roles === "string") {
        user.roles = [user.roles]
      } else {
        user.roles = []
      }
    }

    if (user) {
      this.userSubject.next(user)
    }

    return user
  }

  // Synchronous method to get current user from BehaviorSubject
  getCurrentUserSync(): any {
    return this.userSubject.value
  }

  async getUserRole(): Promise<string | null> {
    const user = await this.getCurrentUser()
    if (!user || !user.roles || user.roles.length === 0) {
      return null
    }
    return user.roles[0]
  }

  sitterRegister(petSitterData: FormData): Observable<any> {
    return this.http.post(baseUrl + "registerpetsitter", petSitterData).pipe(
      switchMap((response: any) =>
        from(
          (async () => {
            await this.initStorage()

            if (response?.token) {
              await this.storage.set("auth_token", response.token)
              this.tokenSubject.next(response.token)
            }

            if (response?.user_information) {
              // Ensure roles is always an array
              if (response.user_information.roles && !Array.isArray(response.user_information.roles)) {
                if (typeof response.user_information.roles === "string") {
                  response.user_information.roles = [response.user_information.roles]
                } else {
                  response.user_information.roles = []
                }
              }

              await this.storage.set("current_user", response.user_information)
              this.userSubject.next(response.user_information)
            }

            // Add delay to ensure storage operations are complete
            await new Promise((resolve) => setTimeout(resolve, 100))

            return response
          })(),
        ),
      ),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 422) {
          // Format validation errors for better display
          const errors = error.error.errors
          const firstError = Object.values(errors)[0]
          const errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError)
          this.errorHandler.showErrorToast(errorMessage)
          return throwError(() => error.error.errors)
        }
        return this.errorHandler.handleError(error)
      }),
    )
  }

  // Method to refresh user data - simplified since we don't have /user endpoint
  refreshUserData(): Observable<any> {
    // Since we don't have a /user endpoint, we'll just return the current user
    const currentUser = this.userSubject.value
    if (currentUser) {
      return of(currentUser)
    } else {
      return throwError(() => new Error("No user data available"))
    }
  }

  // Method to check token validity - simplified approach
  checkTokenValidity(): Observable<boolean> {
    return from(this.getToken()).pipe(
      switchMap((token) => {
        if (!token) {
          return of(false)
        }

        // Since we don't have a /user endpoint, we'll assume token is valid if it exists
        // and we have user data. In a real app, you'd want to verify with the backend.
        const currentUser = this.userSubject.value
        if (currentUser && token) {
          console.log("Token validation: Token and user data exist")
          return of(true)
        } else {
          console.log("Token validation: Missing token or user data")
          return of(false)
        }
      }),
      catchError((error) => {
        console.log("Token validation failed:", error)
        return of(false)
      }),
    )
  }

  // Method to wait for user data to be available
  async waitForUserData(maxWaitTime = 3000): Promise<any> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const user = this.userSubject.value
      if (user) {
        console.log("User data found:", user)
        return user
      }

      // Wait 50ms before checking again
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    console.log("Timeout waiting for user data")
    return null
  }
}
