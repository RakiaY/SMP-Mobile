import { Component, OnInit }    from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule }          from '@angular/common';
import { RouterModule, Router }  from '@angular/router';
import { HttpClientModule }      from '@angular/common/http';
import { Storage }               from '@ionic/storage-angular';
import { FormsModule }           from '@angular/forms';

import { SearchSitterService }   from '../services/search-sitter.service';
import { Search }                from '../models/search.model';

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
    private router:       Router,
    private searchSvc:    SearchSitterService,
    private storage:      Storage,
    private toastCtrl:    ToastController
  ) {}

  async ngOnInit() {
    const current = await this.storage.get('current_user');
    this.ownerId = current?.id;

    this.searchSvc.getAll().subscribe({
      next: all => {
        this.mySearches = all.filter(s => s.ownerId === this.ownerId);
        this.loading = false;

        if (this.mySearches.length === 0) {
          this.presentEmptyToast();
        }
      },
      error: () => this.loading = false,
    });
  }

  addSearch() {
    this.router.navigate(['/add-search']);
  }

  editSearch(id: number) {
    this.router.navigate(['/edit-search', id]);
  }

  deleteSearch(id: number) {
    // your deletion logic here…
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  private async presentEmptyToast() {
    const toast = await this.toastCtrl.create({
      message: "Vous n'avez aucune recherche pour le moment.",
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
}
