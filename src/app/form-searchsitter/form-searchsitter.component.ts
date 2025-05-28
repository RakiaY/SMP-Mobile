// src/app/form-searchsitter/form-searchsitter.component.ts

import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule, ToastController }               from '@ionic/angular';
import { RouterModule, Router, ActivatedRoute }       from '@angular/router';
import { ReactiveFormsModule }                        from '@angular/forms';
import { FormsModule }                                from '@angular/forms';
import { CommonModule }                               from '@angular/common';
import { PetService }                                 from '../services/pet.service';
import { AuthService }                                from '../services/auth.service';
import { SearchSitterService }                        from '../services/search-sitter.service';
import { Storage }                                    from '@ionic/storage-angular';
import * as L                                        from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Slot {
  start_time: string;
  end_time:   string;
}

@Component({
  standalone:   true,
  selector:     'app-form-searchsitter',
  imports:      [
    IonicModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  schemas:      [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl:  './form-searchsitter.component.html',
  styleUrls:    ['./form-searchsitter.component.scss'],
})
export class FormSearchSitterComponent implements OnInit {
  // mode add vs update
  public isEditMode = false;
  private currentId: number | null = null;

  public Pets: any[] = [];
  public newSearch = {
    id:                null as number|null,
    pet_id:            '',
    adresse:           '',
    care_type:         '',
    start_date:        '',
    end_date:          '',
    expected_services: '',
    remunerationMin:   null as number|null,
    remunerationMax:   null as number|null,
    latitude:          '',
    longitude:         ''
  };

  private _passagesPerDay = 1;
  get passagesPerDay(): number { return this._passagesPerDay; }
  set passagesPerDay(value: number) {
    const count = Math.max(1, Math.min(5, value));
    this._passagesPerDay = count;
    this.slots = Array.from({ length: count }, (_, i) =>
      this.slots[i] || { start_time: '', end_time: '' }
    );
    this.showStartPicker = Array(count).fill(false);
    this.showEndPicker   = Array(count).fill(false);
  }
  public slots: Slot[] = [];

  public showPetsList         = false;
  public selectedPet: any      = null;
  public map: any              = null;
  public marker: any           = null;
  public showMap              = false;
  public showStartPicker: boolean[]    = [];
  public showEndPicker:   boolean[]    = [];
  public showStartDatePicker = false;
  public showEndDatePicker   = false;

  private _storage!: Storage;

  constructor(
    private storage:       Storage,
    private toastCtrl:     ToastController,
    private petService:    PetService,
    private router:        Router,
    private route:         ActivatedRoute,
    private auth:          AuthService,
    private searchService: SearchSitterService,
  ) {
    this.initStorage();
  }

  async ngOnInit() {
    // Leaflet icons setup
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    });

    // 1) Load current user, then pets
    const user = await this.auth.getCurrentUser();
    if (user?.id) {
      this.petService.getPetsByOwner(user.id).subscribe({
        next: pets => {
          this.Pets = pets;

          // 2) Only after Pets[] is populated, check for edit-mode
          const idParam = this.route.snapshot.paramMap.get('id');
          if (idParam) {
            this.isEditMode = true;
            this.currentId   = +idParam;
            this.loadExisting(this.currentId);
          }
        },
        error: err => console.error('Erreur pets:', err)
      });
    }
  }

  private async initStorage() {
    this._storage = await this.storage.create();
  }

  private loadExisting(id: number) {
    this.searchService.getById(id).subscribe(search => {
      this.newSearch = {
        id:                search.searchId,
        pet_id:            String(search.petId),
        adresse:           search.address,
        care_type:         search.careType,
        start_date:        this.formatYMD(search.startDate),
        end_date:          this.formatYMD(search.endDate),
        expected_services: search.expectedServices,
        remunerationMin:   search.minPrice,
        remunerationMax:   search.maxPrice,
        latitude:          (search as any).latitude,
        longitude:         (search as any).longitude
      };
      this.selectedPet = this.Pets.find(p => p.id === search.petId);
      if (search.careType === 'chez_proprietaire') {
        this.passagesPerDay = search.passagesPerDay!;
        this.slots          = search.slots!.map(s => ({
          start_time: s.startTime,
          end_time:   s.endTime
        }));
      }
    });
  }

  togglePetsList() {
    this.showPetsList = !this.showPetsList;
  }

  selectPet(pet: any) {
    this.newSearch.pet_id = pet.id;
    this.selectedPet      = pet;
    this.showPetsList     = false;
  }

  getPetPhotoUrl(photoProfil: string|null): string {
    return photoProfil
      ? `http://localhost:8000/storage/${photoProfil}`
      : 'assets/default-pet.png';
  }

  onCareTypeChange() {
    if (this.newSearch.care_type === 'chez_proprietaire') {
      this.passagesPerDay = this.passagesPerDay || 1;
    } else {
      this.passagesPerDay = 1;
      this.slots = [];
    }
  }

  addSlot() {
    if (this.slots.length < 5) {
      this.slots.push({ start_time:'', end_time:'' });
      this.passagesPerDay = this.slots.length;
    }
  }

  removeSlot(i: number) {
    this.slots.splice(i, 1);
    this.passagesPerDay = this.slots.length || 1;
  }

  openStartPicker(i: number) { this.showStartPicker[i] = true; }
  closeStartPicker(i: number) { this.showStartPicker[i] = false; }
  openEndPicker(i: number)   { this.showEndPicker[i]   = true; }
  closeEndPicker(i: number)  { this.showEndPicker[i]   = false; }

  extractHHMM(raw: string): string {
    if (!raw) return '';
    // If it's ISO ("2025-05-30T08:00:00"), grab after the T
    if (raw.includes('T')) {
      return raw.split('T')[1].slice(0,5);
    }
    // Otherwise assume it's already "HH:mm"
    return raw.slice(0,5);
  }

  openStartDatePicker() { this.showStartDatePicker = true; }
  closeStartDatePicker() { this.showStartDatePicker = false; }
  openEndDatePicker()   { this.showEndDatePicker   = true; }
  closeEndDatePicker()  { this.showEndDatePicker   = false; }

  onStartDateSelected(evt: any) {
    this.newSearch.start_date = evt.detail.value;
    this.closeStartDatePicker();
  }

  onEndDateSelected(evt: any) {
    this.newSearch.end_date = evt.detail.value;
    this.closeEndDatePicker();
  }

  openMap() {
    this.showMap = true;
    setTimeout(() => {
      if (!this.map) {
        this.map = L.map('map').setView([36.8065,10.1815],7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:'© OpenStreetMap contributors'
        }).addTo(this.map);
        this.map.on('click',(e:any) => {
          const {lat,lng} = e.latlng;
          this.newSearch.latitude  = lat;
          this.newSearch.longitude = lng;
          L.marker([lat,lng]).addTo(this.map)
            .bindPopup('Position sélectionnée').openPopup();
          this.reverseGeocode(lat,lng);
        });
      } else {
        this.map.invalidateSize();
      }
    },300);
  }

  closeMap() { this.showMap = false; }

  private reverseGeocode(lat:number,lng:number) {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&language=fr`)
      .then(r=>r.json()).then(data=>{
        this.newSearch.adresse = data.address?.road
          ? `${data.address.road}, ${data.address.city||data.address.town||''}, ${data.address.country||''}`
          : 'Adresse non trouvée';
      });
  }

  async saveSearch() {
    const user = await this._storage.get('current_user');
    if (!user?.roles?.includes('petowner')) {
      return this.presentToast('Accès réservé aux petowners','danger');
    }

    const fd = new FormData();
    fd.append('user_id',           user.id);
    fd.append('pet_id',            this.newSearch.pet_id);
    fd.append('adresse',           this.newSearch.adresse);
    fd.append('care_type',         this.newSearch.care_type);
    fd.append('start_date',        this.newSearch.start_date);
    fd.append('end_date',          this.newSearch.end_date);
    fd.append('expected_services', this.newSearch.expected_services);
    fd.append('remunerationMin',   String(this.newSearch.remunerationMin));
    fd.append('remunerationMax',   String(this.newSearch.remunerationMax));
    fd.append('latitude',          String(this.newSearch.latitude));
    fd.append('longitude',         String(this.newSearch.longitude));

    if (this.newSearch.care_type==='chez_proprietaire') {
      fd.append('passages_per_day', String(this.passagesPerDay));
      this.slots.forEach((s,i) => {
        fd.append(`slots[${i}][start_time]`, s.start_time);
        fd.append(`slots[${i}][end_time]`,   s.end_time);
      });
    }

    const obs = this.isEditMode && this.currentId
      ? this.searchService.updateSearch(this.currentId, fd)
      : this.searchService.addSearch(fd);

    obs.subscribe({
    next: res => {
      console.log('💾 Update / Add response:', res);
      this.presentToast(
        this.isEditMode ? 'Recherche mise à jour' : 'Recherche ajoutée',
        'success'
      );
      this.router.navigate(['/dashboard']);
    },
    error: err => {
      console.error('🔥 Update/Add error:', err);
      this.presentToast('Erreur lors de l’enregistrement', 'danger');
    }
  });
  }

  private async presentToast(msg:string,col:string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: col });
    await t.present();
  }

  private formatYMD(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  }

  /** Used by template to format for display */
  public formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }
}
