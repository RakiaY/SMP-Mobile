// add the possible statut values
export type PostulationStatut =
  | 'en_attente'
  | 'annulée'
  | 'validée'
  | 'en cours'
  | 'terminée';

// your existing care‐type
export type CareType = 'chez_proprietaire' | 'en_chenil';

export interface PetOwnerRequest {
  searchId:      number;               // the raw.id from your API
  postulationId?: number;              // newly created or looked‐up postulation
  statut?:       PostulationStatut;    // the sitter’s current statut on that search

  ownerId:     number;
  petId:       number;
  ownerName:   string;
  animalName:  string;
  photoProfil?: string; 
  species:     string;
  address:     string;
  careType:    CareType;
  duration:    string;
  startDate:   Date;
  endDate:     Date;
  minPrice:    number;
  maxPrice:    number;
  //expectedServices: string;
  //passagesPerDay?: number; // optional, not always present
  //slots?: {
  //  slot_order: number; // the order of the slot
  //  start_time: string; // the start time of the slot}
  //  end_time:   string; // the end time of the slot
  //}[];
  
  // toggles for the UI
  //postulated: boolean; // controls the postulate button
  liked:     boolean;  // controls heart vs. heart-outline
  petted:    boolean;  // controls paw highlight
}
