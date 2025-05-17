import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';





@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, 
    RouterModule 
    , ReactiveFormsModule
    ,CommonModule,HttpClientModule

  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent 
{
  loginForm!:FormGroup; // le groupe des champs du formulaire

   constructor(private fb:FormBuilder , 
    private auth: AuthService , 
    private toastController: ToastController,
    private router: Router,
   private storage: Storage) { 
   }
    ngOnInit() {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true],
    });
  }
   onSubmit() {
    this.auth.loginUser(this.loginForm).subscribe({
      next: (response: { token: string; }) => {
      },
      error: (error) => {
        console.error('Erreur de connexion', error);
      }
    });
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'danger',
    });
    toast.present();
  }

  submitForm() {
  this.auth.loginUser(this.loginForm.value).subscribe({
    next: async (res) => {
      const user = await this.storage.get('current_user');
      const roles = user?.roles || [];

      if (roles.includes('petowner')) {
        this.router.navigate(['/dashboard']);
      } else if (roles.includes('petsitter')) {
        this.router.navigate(['/dashboard-sitter']);
      } else {
        await this.showErrorToast('Refused Access.');
      }
    },
    error: (err) => {
      this.showErrorToast('Login ou mot de passe incorrect');
      console.error('Erreur de connexion', err);
    }
  });
}
}

