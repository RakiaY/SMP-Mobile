import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map }        from 'rxjs/operators';

interface BySitterResp { Postulations: any[]; }
interface AddResp      { Postulations: any[]; }
interface UpdateResp   { postulation: any; }

@Injectable({ providedIn: 'root' })
export class PostulationService {
  private base = 'http://localhost:8000/api/mobile/postulations';

  constructor(private http: HttpClient) {}

  /** Get all postulations for this sitter */
  bySitter(sitterId: number): Observable<any[]> {
    return this.http
      .get<BySitterResp>(`${this.base}/sitter/${sitterId}`)
      .pipe(map(r => r.Postulations));
  }

  /** Apply (create) a postulation */
  applyToSearch(searchId: number, sitterId: number): Observable<any> {
    return this.http
      .post<AddResp>(`${this.base}/add`, {
        search_id:       searchId,
        pet_sitter_ids: [sitterId]
      })
      .pipe(map(r => r.Postulations[0]));
  }

  /** Toggle status on an existing postulation */
  updateStatus(postulationId: number, statut: string): Observable<any> {
    return this.http
      .put<UpdateResp>(`${this.base}/updateStatut/${postulationId}`, { statut })
      .pipe(map(r => r.postulation));
  }
}
