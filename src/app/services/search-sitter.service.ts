import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PetOwnerRequest } from '../models/pet-owner-request.model';
import { Search } from '../models/search.model';

interface RawSearch {
  id: number;
  user_id: number;
  pet_id: number;
  user_name: string;
  pet_name: string;
  pet_type: string;
  adresse: string;
  care_type: 'chez_proprietaire' | 'en_chenil';
  description: string;
  care_duration: string;
  start_date: string;
  end_date: string;
  expected_services: string,
  remunerationMin: number;
  remunerationMax: number;
  
}

interface ApiResponse {
  Searchs: RawSearch[];
}

@Injectable({ providedIn: 'root' })
export class SearchSitterService {
  private base = 'http://localhost:8000/api/mobile';

  constructor(private http: HttpClient) {}

  getRequests(): Observable<PetOwnerRequest[]> {
    return this.http
      .get<ApiResponse>(`${this.base}/SearchSitter`)
      .pipe(
        tap(r => console.log('🔍 API returned:', r)),
        map(r => r.Searchs.map(raw => ({
          searchId:      raw.id,
          ownerId:       raw.user_id,
          petId:         raw.pet_id,
          ownerName:     raw.user_name,
          animalName:    raw.pet_name,
          species:       raw.pet_type,
          address:       raw.adresse,
          careType:      raw.care_type,
          duration:      raw.care_duration,
          startDate:     new Date(raw.start_date),
          endDate:       new Date(raw.end_date),
          minPrice:      raw.remunerationMin,
          maxPrice:      raw.remunerationMax,
          description:   raw.description,
          // initialise toggles
          postulationId: undefined,
          statut:        undefined,
          liked:         false,
          petted:        false,
        })))
      );
  }

  /** Fetch *all* search-pet-sitter records from the API */
  getAll(): Observable<Search[]> {
    return this.http
      .get<ApiResponse>(`${this.base}/SearchSitter`)
      .pipe(
        tap(r => console.log('🔍 all searches:', r)),
        map(r => r.Searchs.map(raw => ({
          searchId:         raw.id,
          ownerId:          raw.user_id,
          petId:            raw.pet_id,
          petName:          raw.pet_name,
          petType:          raw.pet_type,
          address:          raw.adresse,
          description:      raw.description,
          careType:         raw.care_type,
          careDuration:     raw.care_duration,
          startDate:        new Date(raw.start_date),
          endDate:          new Date(raw.end_date),
          expectedServices: raw.expected_services,
          minPrice:         raw.remunerationMin,
          maxPrice:         raw.remunerationMax,
        })))
      );
  }
}
