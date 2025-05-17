import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

const baseUrl = "http://localhost:8000/api/";


@Injectable({
  providedIn: 'root'
})
export class OwnerServiceService {

  constructor() { }
}
