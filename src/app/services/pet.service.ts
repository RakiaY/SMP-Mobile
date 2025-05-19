import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  private baseUrl = 'http://localhost:8000/api/pets';

  constructor(private http: HttpClient) {}

  addPet(data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, data);
  }

  updatePet(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, data);
  }

  deletePet(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  getPetsByOwner(ownerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/owner/${ownerId}`);
  }
}
