import { Routes } from '@angular/router';
import { SplashComponent } from './splash/splash.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { GuardianFormComponent } from './guardian-form/guardian-form.component';
import { OwnerFormComponent } from './owner-form/owner-form.component';
import { ConfirmationGuardianComponent } from './confirmation-guardian/confirmation-guardian.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FindSitterComponent } from './find-sitter/find-sitter.component';
import { PetProfilePage } from './pet-profile/pet-profile.page';
import { PetsPage }           from './pets/pets.page';
import { DashboardSitterComponent } from './dashboard-sitter/dashboard-sitter.component';

export const routes: Routes = [
  { path: '', component: SplashComponent }, // ✅ doit être tout en haut
  { path: 'home', component: HomeComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'guardian-form', component: GuardianFormComponent },
  { path: 'confirmation-guardian', component: ConfirmationGuardianComponent },
  { path: 'owner-form', component: OwnerFormComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'find-sitter', component: FindSitterComponent },
  { path: 'pets/add', component: PetProfilePage },
  { path: 'pets',        component: PetsPage },
  { path: 'pets/edit/:index', component: PetProfilePage },
    { path: 'dashboard-sitter', component:   DashboardSitterComponent},

  {
    path: 'pet-profile',
    loadComponent: () => import('./pet-profile/pet-profile.page').then( m => m.PetProfilePage)
  },
  {
    path: 'pets',
    loadComponent: () => import('./pets/pets.page').then( m => m.PetsPage)
  }

];
