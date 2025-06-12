import { Component, OnInit } from "@angular/core"
import { IonicModule, ToastController, LoadingController, AlertController } from "@ionic/angular"
import { RouterModule, Router } from "@angular/router"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"
import { AuthService } from "../services/auth.service"
import { ErrorHandlerService } from "../services/error-handler.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [IonicModule, RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  loading = false
  showPassword = false

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
    private errorHandler: ErrorHandlerService,
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })
  }

  async onSubmit() {
    if (this.loginForm.valid && !this.loading) {
      await this.performLogin()
    } else {
      await this.showValidationErrors()
    }
  }

  private async performLogin() {
    const loading = await this.loadingController.create({
      message: "Connexion en cours...",
      spinner: "crescent",
    })
    await loading.present()

    this.loading = true
    const { email, password } = this.loginForm.value

    this.auth.loginUser({ email, password }).subscribe({
      next: async (response) => {
        await loading.dismiss()
        this.loading = false

        await this.showSuccessToast("Connexion réussie !")
        this.redirectBasedOnRole()
      },
      error: async (error) => {
        await loading.dismiss()
        this.loading = false

        console.log("Login error:", error)

        if (error.type === "PENDING_APPROVAL") {
          await this.showPendingApprovalAlert(error.message, email)
        } else if (error.type === "ACCOUNT_INACTIVE") {
          await this.showErrorToast(error.message)
        } else if (error.type === "INVALID_CREDENTIALS") {
          await this.showErrorToast(error.message)
        } else {
          await this.showErrorToast(error.message || "Erreur de connexion")
        }
      },
    })
  }

  private async showPendingApprovalAlert(message: string, email: string) {
    const alert = await this.alertController.create({
      header: "Compte en attente",
      message: message,
      buttons: [
        {
          text: "Vérifier le statut",
          handler: () => {
            this.checkAccountStatus(email)
          },
        },
        {
          text: "OK",
          role: "cancel",
        },
      ],
    })
    await alert.present()
  }

  private async checkAccountStatus(email: string) {
    const loading = await this.loadingController.create({
      message: "Vérification du statut...",
      spinner: "crescent",
    })
    await loading.present()

    this.auth.checkAccountStatus(email).subscribe({
      next: async (response) => {
        await loading.dismiss()

        if (response.status === "Active") {
          await this.showSuccessToast("Votre compte a été approuvé ! Vous pouvez maintenant vous connecter.")
        } else if (response.status === "Pending") {
          await this.showInfoToast("Votre compte est toujours en attente d'approbation.")
        } else {
          await this.showErrorToast("Votre compte a été rejeté. Contactez l'administration.")
        }
      },
      error: async (error) => {
        await loading.dismiss()
        await this.showErrorToast("Impossible de vérifier le statut du compte.")
      },
    })
  }

  private async redirectBasedOnRole() {
    const user = await this.auth.getCurrentUser()

    if (!user) {
      this.router.navigate(["/login"])
      return
    }

    const roles = user.roles || []

    if (roles.includes("petowner") || roles.includes("pet_owner") || roles.includes("owner")) {
      this.router.navigate(["/dashboard"])
    } else if (roles.includes("petsitter") || roles.includes("pet_sitter") || roles.includes("sitter")) {
      this.router.navigate(["/dashboard-sitter"])
    } else if (roles.includes("admin") || roles.includes("super_admin")) {
      this.router.navigate(["/admin-dashboard"])
    } else {
      this.router.navigate(["/home"])
    }
  }

  private async showValidationErrors() {
    const errors = []

    if (this.loginForm.get("email")?.hasError("required")) {
      errors.push("L'email est requis")
    } else if (this.loginForm.get("email")?.hasError("email")) {
      errors.push("Format d'email invalide")
    }

    if (this.loginForm.get("password")?.hasError("required")) {
      errors.push("Le mot de passe est requis")
    }

    await this.showErrorToast(errors.join(", "))
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: "top",
      color: "success",
      icon: "checkmark-circle",
    })
    await toast.present()
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: "top",
      color: "danger",
      icon: "alert-circle",
    })
    await toast.present()
  }

  private async showInfoToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: "top",
      color: "primary",
      icon: "information-circle",
    })
    await toast.present()
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  goToSignup() {
    this.router.navigate(["/signup"])
  }

  goToForgotPassword() {
    this.router.navigate(["/forgot-password"])
  }
}
