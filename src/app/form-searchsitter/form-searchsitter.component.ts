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
import * as L                                         from 'leaflet';
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
    console.log('[passagesPerDay.set] new value:', value);
    const count = Math.max(1, Math.min(5, value));
    this._passagesPerDay = count;
    this.slots = Array.from({ length: count }, (_, i) =>
      this.slots[i] || { start_time: '', end_time: '' }
    );
    this.showStartPicker = Array(count).fill(false);
    this.showEndPicker   = Array(count).fill(false);
    console.log('[passagesPerDay.set] slots array resized:', this.slots);
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
    console.log('[constructor] initializing storage');
    this.initStorage();
  }

  async ngOnInit() {
    console.log('[ngOnInit] start');
    // Leaflet icons setup
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    });

    // 1) Load current user, then pets
    const user = await this.auth.getCurrentUser();
    console.log('[ngOnInit] currentUser:', user);
    if (user?.id) {
      this.petService.getPetsByOwner(user.id).subscribe({
        next: pets => {
          console.log('[ngOnInit] loaded pets:', pets);
          this.Pets = pets;

          // 2) Only after Pets[] is populated, check for edit-mode
          const idParam = this.route.snapshot.paramMap.get('id');
          console.log('[ngOnInit] route idParam:', idParam);
          if (idParam) {
            this.isEditMode = true;
            this.currentId   = +idParam;
            console.log('[ngOnInit] edit mode ON, id=', this.currentId);
            this.loadExisting(this.currentId);
          }
        },
        error: (err: any) => console.error('[ngOnInit] Erreur loading pets:', err)
      });
    }
    console.log('[ngOnInit] end');
  }

  private async initStorage() {
    this._storage = await this.storage.create();
    console.log('[initStorage] storage ready');
  }

  private loadExisting(id: number) {
    console.log('[loadExisting] fetching id=', id);
    this.searchService.getById(id).subscribe(search => {
      console.log('[loadExisting] raw search from API:', search);
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
      console.log('[loadExisting] newSearch bound:', this.newSearch);

      this.selectedPet = this.Pets.find(p => p.id === search.petId);
      console.log('[loadExisting] selectedPet:', this.selectedPet);

      if (search.careType === 'chez_proprietaire') {
        this.passagesPerDay = search.passagesPerDay!;
        this.slots          = search.slots!.map(s => ({
          start_time: s.startTime,
          end_time:   s.endTime
        }));
        console.log('[loadExisting] passagesPerDay & slots:', this.passagesPerDay, this.slots);
      }
    }, err => {
      console.error('[loadExisting] API error:', err);
    });
  }

  togglePetsList() {
    this.showPetsList = !this.showPetsList;
    console.log('[togglePetsList] now', this.showPetsList);
  }

  selectPet(pet: any) {
    console.log('[selectPet] pet selected:', pet);
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
    console.log('[onCareTypeChange] now care_type=', this.newSearch.care_type);
    if (this.newSearch.care_type === 'chez_proprietaire') {
      this.passagesPerDay = this.passagesPerDay || 1;
    } else {
      this.passagesPerDay = 1;
      this.slots = [];
    }
  }

  addSlot() {
    console.log('[addSlot] before slots:', this.slots);
    if (this.slots.length < 5) {
      this.slots.push({ start_time:'', end_time:'' });
      this.passagesPerDay = this.slots.length;
      console.log('[addSlot] after slots:', this.slots);
    }
  }

  removeSlot(i: number) {
    console.log('[removeSlot] removing index', i);
    this.slots.splice(i, 1);
    this.passagesPerDay = this.slots.length || 1;
    console.log('[removeSlot] now slots:', this.slots);
  }

  openStartPicker(i: number) { this.showStartPicker[i] = true; }
  closeStartPicker(i: number) { this.showStartPicker[i] = false; }
  openEndPicker(i: number)   { this.showEndPicker[i]   = true; }
  closeEndPicker(i: number)  { this.showEndPicker[i]   = false; }

  extractHHMM(raw: string): string {
    if (!raw) return '';
    if (raw.includes('T')) {
      return raw.split('T')[1].slice(0,5); // HH:mm
    }
    return raw.slice(0,5); // assume HH:mm format
  }

  openStartDatePicker() { this.showStartDatePicker = true; }
  closeStartDatePicker() { this.showStartDatePicker = false; }
  openEndDatePicker()   { this.showEndDatePicker   = true; }
  closeEndDatePicker()  { this.showEndDatePicker   = false; }

  onStartDateSelected(evt: any) {
    console.log('[onStartDateSelected] value=', evt.detail.value);
    this.newSearch.start_date = evt.detail.value;
    this.closeStartDatePicker();
  }

  onEndDateSelected(evt: any) {
    console.log('[onEndDateSelected] value=', evt.detail.value);
    this.newSearch.end_date = evt.detail.value;
    this.closeEndDatePicker();
  }

  openMap() {
    console.log('[openMap]');
    this.showMap = true;
    setTimeout(() => {
      if (!this.map) {
        this.map = L.map('map').setView([36.8065,10.1815],7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:'© OpenStreetMap contributors'
        }).addTo(this.map);
        this.map.on('click',(e:any) => {
          const {lat,lng} = e.latlng;
          console.log('[openMap] clicked coords', lat, lng);
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

  closeMap() {
    console.log('[closeMap]');
    this.showMap = false;
  }

  private reverseGeocode(lat:number,lng:number) {
    console.log('[reverseGeocode] lat,lng=', lat, lng);
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&language=fr`)
      .then(r=>r.json()).then(data=>{
        this.newSearch.adresse = data.address?.road
          ? `${data.address.road}, ${data.address.city||data.address.town||''}, ${data.address.country||''}`
          : 'Adresse non trouvée';
        console.log('[reverseGeocode] got address:', this.newSearch.adresse);
      });
  }

  async saveSearch() {
    console.log('[saveSearch] start, edit=', this.isEditMode, 'id=', this.currentId);
    console.log('[saveSearch] newSearch=', this.newSearch, 'slots=', this.slots);

    const user = await this._storage.get('current_user');
    if (!user?.roles?.includes('petowner')) {
      return this.presentToast('Accès réservé aux petowners','danger');
    }

    if (this.isEditMode && this.currentId) {
      // --- UPDATE via JSON payload ---
      const payload: any = {
        pet_id:            Number(this.newSearch.pet_id),
        adresse:           this.newSearch.adresse,
        care_type:         this.newSearch.care_type,
        start_date:        this.newSearch.start_date,
        end_date:          this.newSearch.end_date,
        expected_services: this.newSearch.expected_services,
        remunerationMin:   Number(this.newSearch.remunerationMin),
        remunerationMax:   Number(this.newSearch.remunerationMax),
      };

      if (this.newSearch.latitude)  payload.latitude  = parseFloat(this.newSearch.latitude);
      if (this.newSearch.longitude) payload.longitude = parseFloat(this.newSearch.longitude);

      if (this.newSearch.care_type === 'chez_proprietaire') {
        payload.passages_per_day = this.passagesPerDay;
        // ** On n’envoie plus la date, seulement HH:mm **
        payload.slots = this.slots.map(s => ({
          start_time: this.extractHHMM(s.start_time),
          end_time:   this.extractHHMM(s.end_time),
        }));
      }

      console.log('[saveSearch] UPDATE payload:', payload);
      this.searchService.updateSearch(this.currentId, payload)
        .subscribe({
          next: res => {
            console.log('💾 [saveSearch] API response:', res);
            this.presentToast('Recherche mise à jour','success');
            this.router.navigate(['/dashboard']);
          },
          error: err => {
            console.error('🔥 [saveSearch] update error:', err);
            this.presentToast('Erreur lors de la mise à jour','danger');
          }
        });

    } else {
      // --- CREATE via FormData ---
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

      if (this.newSearch.care_type === 'chez_proprietaire') {
        fd.append('passages_per_day', String(this.passagesPerDay));
        // ** On n’envoie plus la date, seulement HH:mm **
        this.slots.forEach((s, i) => {
          fd.append(`slots[${i}][start_time]`, this.extractHHMM(s.start_time));
          fd.append(`slots[${i}][end_time]`,   this.extractHHMM(s.end_time));
        });
      }

      console.log('[saveSearch] CREATE FormData entries:');
      for (const [k, v] of (fd as any).entries()) {
        console.log(`   ${k} = ${v}`);
      }

      this.searchService.addSearch(fd).subscribe({
        next: res => {
          console.log('💾 [saveSearch] API response:', res);
          this.presentToast('Recherche ajoutée','success');
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          console.error('🔥 [saveSearch] create error:', err);
          this.presentToast('Erreur lors de l’enregistrement','danger');
        }
      });
    }
  }


  private async presentToast(msg:string,col:string) {
    console.log('[presentToast]', msg);
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
