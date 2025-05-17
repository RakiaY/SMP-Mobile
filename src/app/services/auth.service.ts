import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

const baseUrl = "http://localhost:8000/api/";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storageReady: Promise<Storage>;

  constructor(private http: HttpClient, private storage: Storage) {
    this.storageReady = this.storage.create(); // on initialise une seule fois
  }

  loginUser(loginData: any): Observable<any> {
    return this.http.post(baseUrl + "Mobile/login", loginData).pipe(
      switchMap((response: any) =>
        from(this.storageReady).pipe( // s'assurer que le storage est prêt
          tap(async () => {
            if (response?.token) {
              await this.storage.set('auth_token', response.token);
            }
            if (response?.user_information) {
              await this.storage.set('current_user', response.user_information);
            }
          })
        )
      )
    );
  }
}
