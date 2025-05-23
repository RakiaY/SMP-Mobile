// src/app/models/search.model.ts
export type CareType = 'chez_proprietaire' | 'en_chenil';

export interface Search {
  searchId:         number;
  ownerId:          number;
  petId:            number;
  petName:          string;
  petType:          string;
  address:          string;
  description:      string;
  careType:         CareType;
  careDuration:     string;
  startDate:        Date;
  endDate:          Date;
  expectedServices: string;
  minPrice:         number;
  maxPrice:         number;
}
