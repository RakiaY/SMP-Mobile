// src/app/models/search.model.ts
export type CareType = 'chez_proprietaire' | 'en_chenil';

export interface Slot {
  slotOrder: number;
  startTime: string;  // format "HH:mm"
  endTime:   string;  // format "HH:mm"
}

export interface Search {
  searchId:         number;
  ownerId:          number;
  petId:            number;
  petName:          string;
  petType:          string;
  photo_profil:     string;
  address:          string;
  careType:         CareType;
  careDuration:     string;
  startDate:        Date;
  endDate:          Date;
  expectedServices: string;
  minPrice:         number;
  maxPrice:         number;

  // nouveaux
  passagesPerDay?: number;
  slots?:         Slot[];
}
