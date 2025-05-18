import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';



@Injectable({
  providedIn: 'root'
})
export class OwnerServiceService {

  constructor() { }
}
