// src/app/models/pet-owner-request.model.ts
export type CareType = 'chez_proprietaire' | 'en_chenil';

export interface PetOwnerRequest {
  ownerId:     number;
  petId:       number;
  price:       number;
  ownerName:   string;
  animalName:  string;
  species:     string;
  address:     string;
  careType:    CareType;
  duration:    string;
  startDate:   Date;
  endDate:     Date;
  liked:       boolean;
  petted:      boolean;
}
