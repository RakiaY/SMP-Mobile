// src/app/dashboard/dashboard.component.ts

import { Component, OnInit }      from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule }            from '@angular/common';
import { RouterModule, Router }    from '@angular/router';
import { HttpClientModule }        from '@angular/common/http';
import { FormsModule }             from '@angular/forms';
import { Storage }                 from '@ionic/storage-angular';

import { SearchSitterService }     from '../services/search-sitter.service';
import { Search }                  from '../models/search.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  selectedSegment: 'Annonces' | 'articles' = 'Annonces';
  mySearches: Search[] = [];
  loading = true;
  private ownerId!: number;
  
  constructor(
    private router:    Router,
    private storage:   Storage,
    private searchSvc: SearchSitterService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    // Initialize the Ionic Storage instance
    await this.storage.create();

    // Try to get the current user
    const current = await this.storage.get('current_user');
    if (!current || !current.id) {
      // No user: redirect to login or show a message
      this.presentToast('Utilisateur non connecté', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    this.ownerId = current.id;
    this.loadSearches();
  }

  private loadSearches() {
    this.loading = true;
    this.searchSvc.getAll().subscribe({
      next: (all) => {
        this.mySearches = all.filter(s => s.ownerId === this.ownerId);
        this.loading = false;
        if (this.mySearches.length === 0) {
          this.presentToast("Vous n'avez aucune recherche pour le moment.", 'medium');
        }
      },
      error: () => {
        this.loading = false;
        this.presentToast('Erreur de chargement', 'danger');
      }
    });
  }

  addSearch() {
    this.router.navigate(['/form-searchsitter']);
  }

  editSearch(id: number) {
    this.router.navigate(['/form-searchsitter', id]);
  }

  deleteSearch(id: number) {
    this.searchSvc.deleteSearch(id).subscribe({
      next: () => {
        this.presentToast('Recherche supprimée avec succès', 'success');
        this.loadSearches();
      },
      error: () => {
        this.presentToast('Erreur lors de la suppression', 'danger');
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color
    });
    await toast.present();
  }

  getPetPhotoUrl(photoProfil: string | null): string {
    if (!photoProfil) {
      return 'assets/default-pet.png';
    }
    return `http://localhost:8000/storage/${photoProfil}`;
  }
}
