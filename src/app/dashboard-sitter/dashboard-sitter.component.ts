import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';  // Add ToastController
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';  // Add HttpClient
import { forkJoin }          from 'rxjs';
import { Storage }           from '@ionic/storage-angular';
import { SearchDetailsModalComponent } from '../search-details-modal/search-details-modal.component';
import { SearchSitterService } from '../services/search-sitter.service';
import { PostulationService }  from '../services/postulation-service.service';
import {
  PetOwnerRequest,
  PostulationStatut
} from '../models/pet-owner-request.model';
import { PetProfileModalComponent } from '../pet-profile-modal/pet-profile-modal.component';

@Component({
  selector: 'app-dashboard-sitter',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
  ],
  templateUrl: './dashboard-sitter.component.html',
  styleUrls: ['./dashboard-sitter.component.scss'],
})
export class DashboardSitterComponent implements OnInit {
  selectedSegment: 'demandes' | 'articles' = 'demandes';
  petOwnerRequests: PetOwnerRequest[] = [];
  loading = true;
  private sitterId = 0;
  private closedSearchIds = new Set<number>();

  constructor(
    private router:    Router,
    private searchSvc: SearchSitterService,
    private postSvc:   PostulationService,
    private storage:   Storage,
    private modalCtrl: ModalController,
    private http:      HttpClient,  // Add HttpClient for API calls
    private toastCtrl: ToastController  // Add ToastController for notifications
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const current = await this.storage.get('current_user');
    this.sitterId = current?.id ?? 0;

    this.checkSitterNotifications();  // 🆕 Check for notifications when sitter opens dashboard

    forkJoin({
      searches: this.searchSvc.getRequests(),
      myPosts:  this.postSvc.bySitter(this.sitterId),
      allPosts: this.postSvc.getAll()
    }).subscribe({
      next: ({ searches, myPosts, allPosts }) => {
        allPosts.forEach(p => {
          if (p.statut === 'en cours' || p.statut === 'terminée') {
            this.closedSearchIds.add(p.search_id);
          }
        });

        const myMap = new Map<number, { id:number; statut:PostulationStatut }>();
        myPosts.forEach(p =>
          myMap.set(p.search_id, { id: p.id, statut: p.statut as PostulationStatut })
        );

        this.petOwnerRequests = searches.map(r => {
          const hit = myMap.get(r.searchId);
          return { ...r,
            postulationId: hit?.id,
            statut:        hit?.statut,
            liked:         hit?.statut === 'en_attente',
          };
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // 🆕 Add method to check sitter notifications
  checkSitterNotifications() {
    this.http.get<any[]>('http://localhost:8000/api/sitter-notifications').subscribe({
      next: async data => {
        if (data.length > 0) {
          const toast = await this.toastCtrl.create({
            message: `${data.length} nouvelle(s) notification(s)`,
            duration: 3000,
            color: 'primary',
            buttons: [{ text: 'OK', role: 'cancel' }]
          });
          toast.present();
        }
      },
      error: err => console.error('Error loading sitter notifications', err)
    });
  }

  get openRequests(): PetOwnerRequest[] {
    return this.petOwnerRequests.filter(r => {
      if (this.closedSearchIds.has(r.searchId)) return false;
      const st = r.statut;
      const freeOrAnnulee = !r.postulationId || st === 'annulée';
      const notClosedSelf  = st !== 'en cours' && st !== 'terminée';
      return freeOrAnnulee && notClosedSelf;
    });
  }

  get postulatedRequests(): PetOwnerRequest[] {
    return this.petOwnerRequests.filter(r => !!r.postulationId);
  }

  togglePostulation(req: PetOwnerRequest) {
    if (!req.postulationId) {
      this.postSvc.applyToSearch(req.searchId, this.sitterId)
        .subscribe(p => {
          req.postulationId = p.id;
          req.statut        = p.statut as PostulationStatut;
          req.liked         = true;
        });
      return;
    }
    if (req.statut === 'annulée') {
      this.postSvc.updateStatus(req.postulationId, 'en_attente')
        .subscribe(p => {
          req.statut = p.statut as PostulationStatut;
          req.liked  = true;
        });
      return;
    }
    if (req.statut === 'en_attente') {
      this.postSvc.updateStatus(req.postulationId, 'annulée')
        .subscribe(p => {
          req.statut = p.statut as PostulationStatut;
          req.liked  = false;
        });
    }
  }

  viewOwner(req: PetOwnerRequest) {
    this.router.navigate(['/owner-profile', req.ownerId]);
  }
  async viewPet(petId: number) { 
    const modal = await this.modalCtrl.create({
      component: PetProfileModalComponent,
      componentProps: { petId }
    });
    await modal.present();
   }
  navigateTo(path: string)   { this.router.navigate([path]); }
  getPetPhotoUrl(p?:string) { return p ? `http://localhost:8000/storage/${p}` : 'assets/default-pet.png'; }

  statusLabel(st?: PostulationStatut) {
    switch (st) {
      case 'en_attente': return 'En attente';
      case 'annulée':    return 'Annulée';
      case 'validée':    return 'Acceptée';
      case 'en cours':   return 'En cours';
      case 'terminée':   return 'Terminée';
      default:           return '';
    }
  }
  statusColor(st?: PostulationStatut) {
    switch (st) {
      case 'en_attente': return 'warning';
      case 'annulée':    return 'danger';
      case 'validée':    return 'success';
      case 'en cours':   return 'primary';
      case 'terminée':   return 'dark';
      default:           return 'medium';
    }
  }
  async viewRequestDetails(req: PetOwnerRequest) {
    const modal = await this.modalCtrl.create({
      component: SearchDetailsModalComponent,
      componentProps: {
        request: req,
        sitterId: this.sitterId
      }
    });
    await modal.present();
  }
  
  goToChatBot() {
    this.router.navigate(['/chatbot']);
  }
  showChatBotButton = true
  closeChatBot() {
    this.showChatBotButton = false;
  }
}
