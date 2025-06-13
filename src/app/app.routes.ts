import type { Routes } from "@angular/router"
import { AuthGuard } from "./guards/auth.guard"
import { LogoutGuard } from "./guards/logout.guard"
import { RoleGuard } from "./guards/role.guard"
import { Injectable } from "@angular/core"
import { Storage } from "@ionic/storage-angular"
import { AuthService } from "./services/auth.service"
import { ToastController } from "@ionic/angular"
import { Router } from "@angular/router"

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadComponent: () => import("./home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    loadComponent: () => import("./login/login.component").then((m) => m.LoginComponent),
    canActivate: [LogoutGuard],
  },
  {
    path: "signup",
    loadComponent: () => import("./signup/signup.component").then((m) => m.SignupComponent),
    canActivate: [LogoutGuard],
  },
  {
    path: "dashboard",
    loadComponent: () => import("./dashboard/dashboard.component").then((m) => m.DashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["petowner", "pet_owner", "owner"] },
  },
  {
    path: "dashboard-sitter",
    loadComponent: () =>
      import("./dashboard-sitter/dashboard-sitter.component").then((m) => m.DashboardSitterComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["petsitter", "pet_sitter", "sitter"] },
  },
  {
    path: "find-sitter",
    loadComponent: () => import("./find-sitter/find-sitter.component").then((m) => m.FindSitterComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["petowner", "pet_owner", "owner"] },
  },
  {
    path: "pets",
    loadComponent: () => import("./pets/pets.page").then((m) => m.PetsPage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["petowner", "pet_owner", "owner"] },
  },
  {
    path: "pet-profile/:id",
    loadComponent: () => import("./pet-profile/pet-profile.page").then((m) => m.PetProfilePage),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["petowner", "pet_owner", "owner"] },
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
  // Fixed routes - using only AuthGuard for general access
  {
    path: "chat-list",
    loadComponent: () => import("./chat-list/chat-list.component").then((m) => m.ChatListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "chat/:id",
    loadComponent: () => import("./chat/chat.component").then((m) => m.ChatComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "notifications",
    loadComponent: () => import("./notification/notification.component").then((m) => m.NotificationComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "notifications-sitter",
    loadComponent: () =>
      import("./sitter-notifications/sitter-notifications.component").then((m) => m.SitterNotificationsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["petsitter", "pet_sitter", "sitter"] },
  },
  {
    path: "chatbot",
    loadComponent: () => import("./chatbot/chatbot.page").then((m) => m.ChatBotPage),
    canActivate: [AuthGuard],
  },
  {
    path: "splash",
    loadComponent: () => import("./splash/splash.component").then((m) => m.SplashComponent),
  },
  {
    path: "guardian-form",
    loadComponent: () => import("./guardian-form/guardian-form.component").then((m) => m.GuardianFormComponent),
    canActivate: [LogoutGuard],
  },
  {
    path: "owner-form",
    loadComponent: () => import("./owner-form/owner-form.component").then((m) => m.OwnerFormComponent),
    canActivate: [LogoutGuard],
  },
  {
    path: "confirmation-guardian",
    loadComponent: () =>
      import("./confirmation-guardian/confirmation-guardian.component").then((m) => m.ConfirmationGuardianComponent),
  },
  {
    path: "gardien-profil/:id",
    loadComponent: () => import("./gardien-profil/gardien-profil.component").then((m) => m.gardienProfilComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "petowner-profil/:id",
    loadComponent: () => import("./petowner-profil/petowner-profil.component").then((m) => m.PetownerProfilComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "form-searchsitter",
    loadComponent: () => import("./form-searchsitter/form-searchsitter.component").then((m) => m.FormSearchSitterComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "form-searchsitter/:id",
    loadComponent: () => import("./form-searchsitter/form-searchsitter.component").then((m) => m.FormSearchSitterComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "petowner-profile",
    loadComponent: () => import("./petowner-profil/petowner-profil.component").then((m) => m.PetownerProfilComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["petowner", "pet_owner", "owner"] },
  },
  {
    path: "gardien-profile",
    loadComponent: () => import("./gardien-profil/gardien-profil.component").then((m) => m.gardienProfilComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["petsitter", "pet_sitter", "sitter"] },
  },
  
  //{
    //path: "**",
    //redirectTo: "home",
  //},
]
