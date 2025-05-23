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
import { AuthGuard } from './guards/auth.guard';
import { LogoutGuard } from './guards/logout.guard';
import { FormSearchSitterComponent} from './form-searchsitter/form-searchsitter.component';
import { PetownerProfilComponent } from './petowner-profil/petowner-profil.component';
import { gardienProfilComponent } from './gardien-profil/gardien-profil.component';

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
  { path: 'pets/edit/:id', component: PetProfilePage },
  { path: 'dashboard-sitter', component:   DashboardSitterComponent},
{ path: 'petowner-profil', component: PetownerProfilComponent },
  { path: 'gardien-profil' , component: gardienProfilComponent},
  { path: '', redirectTo: 'splash', pathMatch: 'full'},
  //{ path: '**', redirectTo: '/home', pathMatch: 'full' },

  {
    path: 'splash',
    loadComponent: () => import('./splash/splash.component').then(m => m.SplashComponent)
  },
{
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    canActivate: [LogoutGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.component').then(m => m.SignupComponent),
    canActivate: [LogoutGuard]
  },
  {
    path: 'owner-form',
    loadComponent: () => import('./owner-form/owner-form.component').then(m => m.OwnerFormComponent),
    canActivate: [LogoutGuard]
  },
  {
    path: 'sitter-form',
    loadComponent: () => import('./guardian-form/guardian-form.component').then(m => m.GuardianFormComponent),
    canActivate: [LogoutGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard-sitter',
    loadComponent: () => import('./dashboard-sitter/dashboard-sitter.component').then(m => m.DashboardSitterComponent),
    canActivate: [AuthGuard]  // <-- protected route
  },
  {
    path: 'find-sitter',
    loadComponent: () => import('./find-sitter/find-sitter.component').then(m => m.FindSitterComponent),
    canActivate: [AuthGuard]  // <-- protected route
  },
  {
    path: 'pet-profile',
    loadComponent: () => import('./pet-profile/pet-profile.page').then( m => m.PetProfilePage),
    canActivate: [AuthGuard]  // <-- protected route
  },
  {
    path: 'pets',
    loadComponent: () => import('./pets/pets.page').then( m => m.PetsPage),
    canActivate: [AuthGuard]  // <-- protected route
  },
  {
  path: 'pets/add',
  loadComponent: () => import('./pet-profile/pet-profile.page').then(m => m.PetProfilePage),
  canActivate: [AuthGuard]  // <-- protected route
},
  { path: 'pets/edit/:id', 
    loadComponent: () => import('./pet-profile/pet-profile.page').then(m => m.PetProfilePage),
  canActivate: [AuthGuard]  // <-- protected route
  },


];
