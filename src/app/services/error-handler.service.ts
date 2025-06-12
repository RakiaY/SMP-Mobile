import { Injectable } from "@angular/core"
import { ToastController } from "@ionic/angular"
import { HttpErrorResponse } from "@angular/common/http"
import { Observable, throwError } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class ErrorHandlerService {
  constructor(private toastController: ToastController) {}

  /**
   * Handle HTTP errors and display appropriate messages
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Une erreur est survenue"
    const statusCode = error.status

    // Handle different error types
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`
    } else {
      // Server-side error
      switch (statusCode) {
        case 400:
          errorMessage = "Requête invalide"
          break
        case 401:
          errorMessage = "Non autorisé. Veuillez vous reconnecter."
          break
        case 403:
          errorMessage = "Accès refusé"
          break
        case 404:
          errorMessage = "Ressource non trouvée"
          break
        case 422:
          // Validation errors
          if (error.error && error.error.errors) {
            const validationErrors = error.error.errors
            const firstError = Object.values(validationErrors)[0]
            errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError)
          } else {
            errorMessage = "Données invalides"
          }
          break
        case 500:
          errorMessage = "Erreur serveur"
          break
        default:
          errorMessage = `Erreur ${statusCode}: ${error.message}`
      }
    }

    // Show toast notification
    this.showErrorToast(errorMessage)

    // Return the error for further handling
    return throwError(() => new Error(errorMessage))
  }

  /**
   * Display error toast
   */
  async showErrorToast(message: string, duration = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: "bottom",
      color: "danger",
      buttons: [
        {
          text: "OK",
          role: "cancel",
        },
      ],
    })
    await toast.present()
  }

  /**
   * Display success toast
   */
  async showSuccessToast(message: string, duration = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: "bottom",
      color: "success",
      buttons: [
        {
          text: "OK",
          role: "cancel",
        },
      ],
    })
    await toast.present()
  }

  /**
   * Display info toast
   */
  async showInfoToast(message: string, duration = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: "bottom",
      color: "primary",
      buttons: [
        {
          text: "OK",
          role: "cancel",
        },
      ],
    })
    await toast.present()
  }
}
