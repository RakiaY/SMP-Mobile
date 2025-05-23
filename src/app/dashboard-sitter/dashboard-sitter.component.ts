import { Component, OnInit } from '@angular/core';
import { IonicModule }       from '@ionic/angular';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';       // ← for [(ngModel)]
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule }  from '@angular/common/http';
import { forkJoin }          from 'rxjs';
import { Storage }           from '@ionic/storage-angular';

import { SearchSitterService }  from '../services/search-sitter.service';
import { PostulationService }   from '../services/postulation-service.service';
import { PetOwnerRequest,
         PostulationStatut }     from '../models/pet-owner-request.model';

@Component({
  selector: 'app-dashboard-sitter',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,    // ← needed for ngModel
    HttpClientModule,
    RouterModule,
  ],
  templateUrl: './dashboard-sitter.component.html',
  styleUrls: ['./dashboard-sitter.component.scss'],
})
export class DashboardSitterComponent implements OnInit {
  // controls which tab is shown
  selectedSegment: 'demandes' | 'articles' = 'demandes';

  petOwnerRequests: PetOwnerRequest[] = [];
  loading = true;
  private sitterId = 0;

  constructor(
    private router:    Router,
    private searchSvc: SearchSitterService,
    private postSvc:   PostulationService,
    private storage:   Storage,
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const current = await this.storage.get('current_user');
    this.sitterId = current?.id ?? 0;

    forkJoin({
      searches: this.searchSvc.getRequests(),
      posts:    this.postSvc.bySitter(this.sitterId)
    }).subscribe({
      next: ({ searches, posts }) => {
        const bySearch = new Map<number, { id:number; statut:string }>();
        posts.forEach(p => bySearch.set(p.search_id, {
          id: p.id, statut: p.statut
        }));

        this.petOwnerRequests = searches.map(r => {
          const hit = bySearch.get(r.searchId);
          const raw = hit?.statut;
          const statut = (raw==='en_attente' || raw==='annulée')
            ? raw as PostulationStatut
            : undefined;

          return {
            ...r,
            postulationId: hit?.id,
            statut,
            liked: statut==='en_attente'
          };
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  togglePostulation(req: PetOwnerRequest) {
    if (!req.postulationId) {
      this.postSvc.applyToSearch(req.searchId, this.sitterId)
        .subscribe(p => {
          req.postulationId = p.id;
          req.statut        = p.statut;
          req.liked         = true;
        });
      return;
    }
    const next = req.statut==='en_attente' ? 'annulée' : 'en_attente';
    this.postSvc.updateStatus(req.postulationId, next)
      .subscribe(p => {
        req.statut = p.statut;
        req.liked  = p.statut==='en_attente';
      });
  }

  get pendingPostulations() {
    return this.petOwnerRequests.filter(r => r.statut==='en_attente');
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
