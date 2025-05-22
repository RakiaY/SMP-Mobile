import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

const baseUrl = "http://localhost:8000/api/";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storageInitialized = false;

  constructor(private http: HttpClient, private storage: Storage) {
    this.initStorage();
  }

  private async initStorage() {
    if (!this.storageInitialized) {
      await this.storage.create();
      this.storageInitialized = true;
    }
  }

  loginUser(loginData: any): Observable<any> {
    return this.http.post(baseUrl + "login", loginData).pipe(
      switchMap((response: any) => 
        from(
          (async () => {
            await this.initStorage();
            if (response?.token) {
              await this.storage.set('auth_token', response.token);
            }
            if (response?.user_information) {
              await this.storage.set('current_user', response.user_information);
            }
            return response;
          })()
        )
      ),
      catchError(error => {
        console.error("Login error:", error);
        return throwError(() => new Error(error?.error?.message || 'Erreur de connexion'));
      })
    );
  }

  registerOwner(ownerData: any): Observable<any> {
    return this.http.post(baseUrl + "registerpetowner", ownerData).pipe(
      switchMap((response: any) =>
        from(this.initStorage()).pipe(
          tap(async () => {
            if (response?.token) {
              await this.storage.set('auth_token', response.token);
              console.log('Inscription réussie, token enregistré');
            }
            if (response?.user_information) {
              await this.storage.set('current_user', response.user_information);
            }
          }),
          switchMap(() => of(response)) // retourne la réponse après le stockage
        )
      ),
      catchError(error => {
        console.error("Erreur inscription propriétaire:", error);
        return throwError(() => new Error(error?.error?.message || 'Erreur lors de l\'inscription'));
      })
    );
  }

  async getToken(): Promise<string | null> {
    await this.initStorage();
    return await this.storage.get('auth_token');
  }

  async isLoggedIn(): Promise<boolean> {
    await this.initStorage();
    const token = await this.storage.get('auth_token');
    console.log('Vérification token:', token);
    return !!token;
}

  async logout(): Promise<void> {
    await this.initStorage();
    await this.storage.remove('auth_token');
    await this.storage.remove('current_user');
  }
  async getCurrentUser(): Promise<any> {
    await this.initStorage();
    return await this.storage.get('current_user');
  }

  async getUserRole(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.role || null;
  }

 sitterRegister(petSitterData: FormData): Observable<any> {
  return this.http.post(baseUrl + "registerpetsitter", petSitterData).pipe(
    catchError(error => {
      if (error.status === 422) {
        return throwError(() => error.error.errors);
      }
      return throwError(() => 'Une erreur est survenue');
    })
  );
}
}
  