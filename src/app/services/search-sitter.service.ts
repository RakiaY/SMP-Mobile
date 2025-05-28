// src/app/services/search-sitter.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { PetOwnerRequest } from '../models/pet-owner-request.model';
import { Search }          from '../models/search.model';

interface RawSearch {
  id: number;
  user_id: number;
  pet_id: number;
  user_name: string;
  pet_name: string;
  pet_type: string;
  photo_profil: string;
  adresse: string;
  care_type: 'chez_proprietaire' | 'en_chenil';
  care_duration: string;
  start_date: string;
  end_date: string;
  expected_services: string;
  remunerationMin: number;
  remunerationMax: number;
  passages_per_day?: number;
  slots?: {
    slot_order: number;
    start_time: string;
    end_time:   string;
  }[];
}

interface ApiResponse {
  Searchs: RawSearch[];
}

@Injectable({ providedIn: 'root' })
export class SearchSitterService {
  private baseMobile = 'http://localhost:8000/api/mobile/SearchSitter';
  private base       = 'http://localhost:8000/api/SearchSitter';

  constructor(private http: HttpClient) {}

  /** For the sitter dashboard */
  getRequests(): Observable<PetOwnerRequest[]> {
    return this.http.get<ApiResponse>(`${this.base}`)
      .pipe(
        tap(r => console.log('🔍 API returned:', r)),
        map(r => r.Searchs.map(raw => ({
          searchId:      raw.id,
          ownerId:       raw.user_id,
          petId:         raw.pet_id,
          ownerName:     raw.user_name,
          animalName:    raw.pet_name,
          photoProfil:   raw.photo_profil,
          species:       raw.pet_type,
          address:       raw.adresse,
          careType:      raw.care_type,
          duration:      raw.care_duration,
          startDate:     new Date(raw.start_date),
          endDate:       new Date(raw.end_date),
          minPrice:      raw.remunerationMin,
          maxPrice:      raw.remunerationMax,
          // initialise toggles
          postulationId: undefined,
          statut:        undefined,
          liked:         false,
          petted:        false,
        })))
      );
  }

  /** Create a new search */
  addSearch(formData: FormData): Observable<any> {
    return this.http.post(`${this.base}/add`, formData)
      .pipe(catchError(err => throwError(() => err.error?.errors || 'Une erreur est survenue')));
  }

  /** Fetch all searches (pet-owner dashboard) */
  getAll(): Observable<Search[]> {
    return this.http.get<ApiResponse>(`${this.base}`)
      .pipe(
        tap(r => console.log('🔍 all searches:', r)),
        map(r => r.Searchs.map(raw => ({
          searchId:        raw.id,
          ownerId:         raw.user_id,
          petId:           raw.pet_id,
          petName:         raw.pet_name,
          petType:         raw.pet_type,
          photo_profil:    raw.photo_profil,
          address:         raw.adresse,
          careType:        raw.care_type,
          careDuration:    raw.care_duration,
          startDate:       new Date(raw.start_date),
          endDate:         new Date(raw.end_date),
          expectedServices: raw.expected_services,
          minPrice:        raw.remunerationMin,
          maxPrice:        raw.remunerationMax,
          passagesPerDay:  raw.passages_per_day,
          slots:           raw.slots?.map(s => ({
                             slotOrder: s.slot_order,
                             startTime: s.start_time,
                             endTime:   s.end_time
                           })) ?? [],
        })))
      );
  }

  /** Fetch a single search by id */
  getById(id: number): Observable<Search> {
    return this.http.get<{ search: RawSearch }>(`${this.base}/${id}`)
      .pipe(
        map(res => {
          const raw = res.search;
          return {
            searchId:         raw.id,
            ownerId:          raw.user_id,
            petId:            raw.pet_id,
            petName:          raw.pet_name,
            petType:          raw.pet_type,
            photo_profil:     raw.photo_profil,
            address:          raw.adresse,
            careType:         raw.care_type,
            careDuration:     raw.care_duration,
            startDate:        new Date(raw.start_date),
            endDate:          new Date(raw.end_date),
            expectedServices: raw.expected_services,
            minPrice:         raw.remunerationMin,
            maxPrice:         raw.remunerationMax,
            passagesPerDay:   raw.passages_per_day,
            slots:            raw.slots?.map(s => ({
                                 slotOrder: s.slot_order,
                                 startTime: s.start_time,
                                 endTime:   s.end_time
                               })) ?? [],
          };
        })
      );
  }

  /** Update an existing search */
  updateSearch(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.base}/update/${id}`, formData)
      .pipe(catchError(err => throwError(() => err.error || 'Une erreur est survenue')));
  }

  /** Delete a search */
  deleteSearch(id: number): Observable<any> {
    return this.http.delete(`${this.base}/delete/${id}`)
      .pipe(catchError(err => throwError(() => 'Une erreur est survenue')));
  }
}
