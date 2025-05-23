import { Component, OnInit }   from '@angular/core';
import { IonicModule }          from '@ionic/angular';
import { CommonModule }         from '@angular/common';
import { RouterModule, Router }from '@angular/router';
import { HttpClientModule }     from '@angular/common/http';
import { forkJoin }             from 'rxjs';
import { PostulationStatut } from '../models/pet-owner-request.model';
import { SearchSitterService }  from '../services/search-sitter.service';
import { PostulationService }   from '../services/postulation-service.service';
import { PetOwnerRequest }      from '../models/pet-owner-request.model';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-dashboard-sitter',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './dashboard-sitter.component.html',
  styleUrls: ['./dashboard-sitter.component.scss'],
})
export class DashboardSitterComponent implements OnInit {
  petOwnerRequests: PetOwnerRequest[] = [];
  loading = true;
  private sitterId = /* get this from your auth/session */ 42;

  constructor(
    private router:    Router,
    private searchSvc: SearchSitterService,
    private postSvc:   PostulationService,
    private storage: Storage
  ) {}

  async ngOnInit() {
    const current = await this.storage.get('current_user');
    this.sitterId = current?.id;
    forkJoin({
      searches: this.searchSvc.getRequests(),
      posts:    this.postSvc.bySitter(this.sitterId)
    }).subscribe({
      next: ({ searches, posts }) => {
        const bySearch = new Map<number, { id: number; statut: string }>();
        posts.forEach(p => bySearch.set(p.search_id, {
          id:     p.id,
          statut: p.statut
        }));

        this.petOwnerRequests = searches.map(r => {
          const hit = bySearch.get(r.searchId);
          // rawStatut is string|undefined; we only accept our two literals
          const rawStatut = hit?.statut;
          const statut = (rawStatut === 'en_attente' || rawStatut === 'annulée')
            ? rawStatut as PostulationStatut
            : undefined;

          return {
            ...r,
            postulationId: hit?.id,
            statut,
            liked: statut === 'en_attente'
          };
        });

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  /** create or toggle a postulation on ♥ click */
  togglePostulation(req: PetOwnerRequest) {
    // 1) first‐time apply
    if (!req.postulationId) {
      this.postSvc.applyToSearch(req.searchId, this.sitterId)
        .subscribe(p => {
          req.postulationId = p.id;
          req.statut        = p.statut;    // "en_attente"
          req.liked         = true;
        });
      return;
    }

    // 2) toggle status
    const next = req.statut === 'en_attente' ? 'annulée' : 'en_attente';
    this.postSvc.updateStatus(req.postulationId, next)
      .subscribe(p => {
        req.statut = p.statut;
        req.liked  = p.statut === 'en_attente';
      });
  }

  viewOwner(req: PetOwnerRequest) {
    this.router.navigate(['/owner-profile', req.ownerId]);
  }

  viewPet(req: PetOwnerRequest) {
    req.petted = !req.petted;
    this.router.navigate(['/pet-profile', req.petId]);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  getStatusColor(active: boolean) {
    return active ? 'warning' : 'medium';
  }
}
