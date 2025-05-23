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
  species:     string;
  address:     string;
  careType:    CareType;
  duration:    string;
  startDate:   Date;
  endDate:     Date;
  minPrice:    number;
  maxPrice:    number;
  description:  string;

  liked:     boolean;  // controls heart vs. heart-outline
  petted:    boolean;  // controls paw highlight
}
