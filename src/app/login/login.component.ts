import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    IonicModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  /** Affiche un toast Ionic */
  private async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  /** Soumission du formulaire */
  submitForm() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.auth.loginUser(this.loginForm.value).subscribe({
      next: async () => {
        /** On attend que le token & l’utilisateur soient bien stockés */
        const user = await this.auth.getCurrentUser();
        const token = await this.auth.getToken();
        this.loading = false;

        if (!token || !user) {
          await this.showToast('Refused Access.', 'danger');
          return;
        }

        const roles = user.roles || [];

        if (roles.includes('petowner')) {
          await this.showToast('Connexion réussie !', 'success');
          this.router.navigate(['/dashboard']);
        } else if (roles.includes('petsitter')) {
          await this.showToast('Connexion réussie !', 'success');
          this.router.navigate(['/dashboard-sitter']);
        } else {
          await this.showToast('Refused Access.', 'danger');
        }
      },
      error: async () => {
        this.loading = false;
        await this.showToast('Login ou mot de passe incorrect', 'danger');
      }
    });
  }
}
