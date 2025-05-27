import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // Assurez-vous d'importer IonicModule
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Importation de ReactiveFormsModule
import { FormsModule } from '@angular/forms';
import { PetService } from '../services/pet.service';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SearchSitterService } from '../services/search-sitter.service';
import { IonicStorageModule } from '@ionic/storage-angular'; // Ajoutez cette importation
import { Drivers } from '@ionic/storage'; // Ajoutez cette importation
import { CommonModule } from '@angular/common';
import { Storage } from '@ionic/storage-angular'; // Ajoutez cette importation


interface Slot {
  start_time: string;
  end_time: string;
}

@Component({
  standalone:true,
  selector: 'app-form-searchsitter',
  imports: [IonicModule, RouterModule, ReactiveFormsModule,FormsModule, IonicStorageModule, CommonModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],   // <— ajoutez ceci

    templateUrl: './form-searchsitter.component.html',
  styleUrls: ['./form-searchsitter.component.scss'],
})
export class FormSearchSitterComponent   {



      Pets: any[] = [];
      newSearch={
    id: null,
    pet_id: '',
    adresse: '',
    care_type: '',
    start_date: '',
    end_date: '',
    expected_services: '',
    remunerationMin: null,
    remunerationMax: null,
    latitude: '',
    longitude: ''
   }
   // Nouveaux champs pour "chez_proprietaire"
 // Gestion du nombre de passages avec setter/getter
  private _passagesPerDay: number = 1;
  get passagesPerDay(): number {
    return this._passagesPerDay;
  }
  set passagesPerDay(value: number) {
  const count = Math.max(1, Math.min(5, value));
  this._passagesPerDay = count;
  this.slots = Array.from({ length: count }, (_, i) =>
    this.slots[i] || { start_time: '', end_time: '' }
  );
  // important : deux drapeaux séparés
  this.showStartPicker = Array(count).fill(false);
  this.showEndPicker   = Array(count).fill(false);
}

  slots: Array<{ start_time: string; end_time: string }> = [];
showPetsList = false;
selectedPet: any = null;
  
   map: any;
    marker: any;
  showMap: boolean = false;
  private _storage: Storage | null = null;

  constructor( private storage: Storage,
    private toastCtrl: ToastController,
    private petService: PetService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private searchService: SearchSitterService,
        private fb: FormBuilder,

  ) {     this.init();
}

  async ngOnInit() {

    // Corriger le problème d’icônes manquantes de Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    });

     const user = await this.auth.getCurrentUser();
    console.log('USER CONNECTÉ:', user); // ✅ Ajoute ça

    if (user?.id) {
      this.petService.getPetsByOwner(user.id).subscribe({
        next: (pets) => {
          this.Pets = pets;
          console.log('Mes animaux:', this.Pets);
        },
        error: (err) => {
          console.error('Erreur de chargement des animaux:', err);
        }
      });
    } else {
      console.warn("Aucun utilisateur connecté.");
    }
    
  
  }
async init() {
    const storage =     await this.storage['create']();

    this._storage = storage;
  }
  togglePetsList() {
  this.showPetsList = !this.showPetsList;
}

// Quand l’utilisateur choisit un pet
selectPet(pet: any) {
  this.newSearch.pet_id = pet.id;
  this.selectedPet = pet;
  this.showPetsList = false;
}
getPetPhotoUrl(photoProfil: string | null): string {
  if (!photoProfil) {
    return 'assets/default-pet.png';
  }
  // S’assure du protocole et du chemin correct
  return `http://localhost:8000/storage/${photoProfil}`;
}
onPassagesPerDayChange(value: string | null | undefined): void {
    const newCount = value ? parseInt(value, 10) : 0;
    this.passagesPerDay = newCount;

    // Reconstruire exactement newCount slots, en préservant si possible
    const newSlots: Slot[] = [];
    for (let i = 0; i < newCount; i++) {
      newSlots.push(this.slots[i] || { start_time: '', end_time: '' });
    }
    this.slots = newSlots;
  }
   onCareTypeChange() {
  switch(this.newSearch.care_type) {
    case 'chez_proprietaire':
      this.passagesPerDay = this.passagesPerDay || 1; // Garde la valeur existante ou 1 par défaut
      if (!this.slots || this.slots.length === 0) {
        this.onPassagesPerDayChange(this.passagesPerDay.toString());
      }
      break;
    case 'en_chenil':
      // Nettoie les données spécifiques à la garde à domicile
      this.passagesPerDay = 1;
      this.slots = [];
      break;
  }
}

  async saveSearch() {
    const currentUser = await this.storage.get('current_user');
    if (!currentUser || !currentUser.roles?.includes('petowner')) {
      this.presentToast('Accès refusé : réservé aux petowners', 'danger');
      return;
    }

    const formData = new FormData();
    const petOwnerId = currentUser.id;
    console.log('▶️ Sending pet_owner_id =', petOwnerId);
    formData.append('user_id', petOwnerId);
    formData.append('pet_id', this.newSearch.pet_id);
  formData.append('adresse', this.newSearch.adresse);
  formData.append('care_type', this.newSearch.care_type);
  formData.append('start_date', this.formatDateToYMD(this.newSearch.start_date));
  formData.append('end_date', this.formatDateToYMD(this.newSearch.end_date));
  formData.append('expected_services', this.newSearch.expected_services);
  formData.append('remunerationMin', String(Number(this.newSearch.remunerationMin)));
formData.append('remunerationMax', String(Number(this.newSearch.remunerationMax)));
  formData.append('latitude', this.newSearch.latitude);
  formData.append('longitude', this.newSearch.longitude);
  // Champs conditionnels
    if (this.newSearch.care_type === 'chez_proprietaire') {
      formData.append('passages_per_day', this.passagesPerDay.toString());
      this.slots.forEach((slot, i) => {
        formData.append(`slots[${i}][start_time]`, slot.start_time);
        formData.append(`slots[${i}][end_time]`, slot.end_time);
      });
    }

  


  this.searchService.addSearch(formData).subscribe({
     next: () => {
        this.presentToast('Search ajouté avec succès', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erreur ajout Search:', err);
        this.presentToast("Erreur lors de l'ajout", 'danger');
      },
    });
  }
  
async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
 // Dans form-searchsitter.component.ts
addSlot() {
  const MAX_SLOTS = 6;

  if (this.slots.length < MAX_SLOTS) {
    // 1) On ajoute le nouveau créneau vide
    this.slots.push({ start_time: '', end_time: '' });

    // 2) On met à jour passagesPerDay pour que le formData soit cohérent
    this.passagesPerDay = this.slots.length;
  }
}


  removeSlot(index: number) {
    this.slots.splice(index, 1);
  }

  getAddressFromCoordinates(lat: number, lng: number): void {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&language=fr`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.address) {
        // Remplir le champ adresse avec les informations renvoyées par l'API
this.newSearch.adresse = data.address.road
  ? `${data.address.road}, ${data.address.city || data.address.town || ''}, ${data.address.country || ''}`
  : "Adresse non trouvée";
      } else {
  this.newSearch.adresse = "Adresse non trouvée";
}

    })
    .catch(error => {
  console.error('Erreur lors de la récupération de l\'adresse :', error);
  this.newSearch.adresse = "Erreur de géocodage";
});

}
openMap() {
  this.showMap = true;

  setTimeout(() => {
    if (!this.map) {
      this.map = L.map('map').setView([36.8065, 10.1815], 7); // Vue sur la Tunisie
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('click', (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

this.newSearch.latitude = lat;
        this.newSearch.longitude = lng;

        L.marker([lat, lng]).addTo(this.map)
          .bindPopup('Position sélectionnée')
          .openPopup();

        // Appeler la fonction pour récupérer l'adresse
        this.getAddressFromCoordinates(lat, lng);
      });
    } else {
      this.map.invalidateSize(true); // Forcer le redimensionnement
    }
  }, 300);
}
resetMarker() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
      this.newSearch.latitude = '';
      this.newSearch.longitude = '';
    }
  }


closeMap() {
  this.showMap = false;
}
formatDateToYMD(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

  birthDate: string = '';           
  birthDateValue: string = '';      


// Pour afficher une date formatée dans le champ
formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(); // ou d.toISOString().slice(0, 10)
}
 extractHHMM(iso: string): string {
  if (!iso) return '';
  // Méthode simple par découpage
  const parts = iso.split('T');
  if (parts.length < 2) return '';
  return parts[1].slice(0, 5); // on prend "HH:MM"
}
// Nouveau : deux tableaux de flags
showStartPicker: boolean[] = [];
showEndPicker: boolean[]   = [];

// Ouvrir / fermer le picker de début
openStartPicker(i: number) {
  // enlève le focus pour éviter l'aria-hidden error
  (document.activeElement as HTMLElement)?.blur();
  this.showStartPicker[i] = true;
}
closeStartPicker(i: number)  { 
    (document.activeElement as HTMLElement)?.blur();

  this.showStartPicker[i] = false; }

// Ouvrir / fermer le picker de fin
openEndPicker(i: number)     { this.showEndPicker[i]   = true; }
closeEndPicker(i: number)    { this.showEndPicker[i]   = false; }

  // Quand l’heure début est choisie
  onStartTimeSelected(event: any, i: number) {
    this.slots[i].start_time = event.detail.value;
  }

  // Quand l’heure fin est choisie
  onEndTimeSelected(event: any, i: number) {
    this.slots[i].end_time = event.detail.value;
  }
  // Deux flags séparés
public showStartDatePicker = false;
public showEndDatePicker   = false;

// Ouvrir / fermer le picker date de début
openStartDatePicker()   {
  (document.activeElement as any)?.blur(); // retire le focus éventuel
  this.showStartDatePicker = true;
}
closeStartDatePicker()  {
  this.showStartDatePicker = false;
}

// Ouvrir / fermer le picker date de fin
openEndDatePicker()     {
  (document.activeElement as any)?.blur();
  this.showEndDatePicker = true;
}
closeEndDatePicker()    {
  this.showEndDatePicker = false;
}

// Handler spécifique pour la date de début
onStartDateSelected(event: any) {
  this.newSearch.start_date = event.detail.value;
}

// Handler spécifique pour la date de fin
onEndDateSelected(event: any) {
  this.newSearch.end_date = event.detail.value;
}



}
