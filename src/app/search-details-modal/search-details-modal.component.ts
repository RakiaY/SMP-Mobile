// src/app/search-details-modal/search-details-modal.component.ts

import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PostulationService } from '../services/postulation-service.service';
import {
  PetOwnerRequest,
  PostulationStatut
} from '../models/pet-owner-request.model';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule],
  selector: 'app-search-details-modal',
  templateUrl: './search-details-modal.component.html',
  styleUrls: ['./search-details-modal.component.scss'],
})
export class SearchDetailsModalComponent {
  @Input() request!: PetOwnerRequest;
  @Input() sitterId!: number;

  constructor(
    private modalCtrl: ModalController,
    private postSvc:  PostulationService
  ) {}

  close() {
    this.modalCtrl.dismiss();
  }

  async togglePostulation() {
    // 1) jamais postulé
    if (!this.request.postulationId) {
      const p = await this.postSvc.applyToSearch(this.request.searchId, this.sitterId).toPromise();
      this.request.postulationId = p.id;
      this.request.statut        = p.statut as PostulationStatut;
      return;
    }

    // 2) si annulée → reposter
    if (this.request.statut === 'annulée') {
      const p = await this.postSvc.updateStatus(this.request.postulationId, 'en_attente').toPromise();
      this.request.statut = p.statut as PostulationStatut;
      return;
    }

    // 3) si en_attente → annuler
    if (this.request.statut === 'en_attente') {
      const p = await this.postSvc.updateStatus(this.request.postulationId, 'annulée').toPromise();
      this.request.statut = p.statut as PostulationStatut;
      return;
    }

    // for other statuses, do nothing
  }

  get buttonLabel() {
    switch (this.request.statut) {
      case undefined:     return 'Postuler à cette garde';
      case 'annulée':     return 'Repousler cette garde';
      case 'en_attente':  return 'Annuler ma postulation';
      default:            return '';  // hide for 'validée' / 'en cours' / 'terminée'
    }
  }

  get buttonColor() {
    switch (this.request.statut) {
      case undefined:     return 'primary';
      case 'annulée':     return 'primary';
      case 'en_attente':  return 'danger';
      default:            return 'medium';
    }
  }
}
