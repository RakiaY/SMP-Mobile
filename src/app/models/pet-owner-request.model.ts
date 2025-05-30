// src/app/models/pet-owner-request.model.ts

// possible statut values
export type PostulationStatut =
  | 'en_attente'
  | 'annulée'
  | 'validée'
  | 'en cours'
  | 'terminée';

export type CareType = 'chez_proprietaire' | 'en_chenil';

export interface Slot {
  slotOrder: number;
  startTime: string;  // format "HH:mm"
  endTime:   string;  // format "HH:mm"
}

export interface PetOwnerRequest {
  searchId:      number;
  postulationId?: number;
  statut?:       PostulationStatut;
  ownerId:       number;
  petId:         number;
  ownerName:     string;
  animalName:    string;
  photoProfil?:  string;
  species:       string;
  address:       string;
  careType:      CareType;
  duration:      string;
  startDate:     Date;
  endDate:       Date;
  minPrice:      number;
  maxPrice:      number;
  expectedServices?: string;

  // ** nouveautés pour chez propriétaire **
  passagesPerDay?: number;
  slots?:         Slot[];

  // toggles UI
  liked:   boolean;
  petted:  boolean;
}
