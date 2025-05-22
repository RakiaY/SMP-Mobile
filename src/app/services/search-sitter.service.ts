// src/app/services/search-sitter.service.ts
import { Injectable } from '@angular/core';
import { HttpClient }     from '@angular/common/http';
import { Observable }     from 'rxjs';
import { map, tap }       from 'rxjs/operators';
import { PetOwnerRequest, CareType } from '../models/pet-owner-request.model';

interface RawSearch {
  id:               number;
  user_id:          number;
  pet_id:           number;
  user_name:        string;
  pet_name:         string;
  pet_type?:        string;
  adresse:          string;
  care_type:        CareType;    // now matches your CareType
  care_duration:    string;
  start_date:       string;
  end_date:         string;
  remunerationMin:  number;
}

interface ApiResponse {
  Searchs: RawSearch[];
}

@Injectable({ providedIn: 'root' })
export class SearchSitterService {
  private baseUrl = 'http://localhost:8000/api/mobile';

  constructor(private http: HttpClient) {}

  getRequests(): Observable<PetOwnerRequest[]> {
    return this.http
      .get<ApiResponse>(`${this.baseUrl}/SearchSitter`)
      .pipe(
        tap(resp => console.log('🔍 API returned:', resp)),
        map(resp =>
          (resp.Searchs || []).map(raw => ({
            ownerId:    raw.user_id,
            petId:      raw.pet_id,
            ownerName:  raw.user_name,
            animalName: raw.pet_name,
            species:    raw.pet_type ?? '—',
            address:    raw.adresse,
            careType:   raw.care_type,       // now exactly the API value
            duration:   raw.care_duration,
            startDate:  new Date(raw.start_date),
            endDate:    new Date(raw.end_date),
            price:      raw.remunerationMin,
            liked:      false,
            petted:     false,
          }))
        )
      );
  }
}
