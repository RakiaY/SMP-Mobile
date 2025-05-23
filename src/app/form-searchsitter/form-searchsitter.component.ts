import { Component, OnInit } from '@angular/core';
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

@Component({
  standalone:true,
  selector: 'app-form-searchsitter',
  imports: [IonicModule, RouterModule, ReactiveFormsModule,FormsModule, IonicStorageModule ] ,
    templateUrl: './form-searchsitter.component.html',
  styleUrls: ['./form-searchsitter.component.scss'],
})
export class FormSearchSitterComponent   {

      Pets: any[] = [];
      newSearch={
    id: null,
    user_id: '',
    pet_id: '',
    adresse: '',
    description: '',
    care_type: '',
    care_duration: '',
    start_date: '',
    end_date: '',
    expected_services: '',
    remunerationMin: null,
    remunerationMax: null,
    latitude: '',
    longitude: ''
   }
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
    private searchService: SearchSitterService
  ) {     this.init();
}

  async ngOnInit() {
    await this.storage['create']();

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

  async saveSearch() {
    const currentUser = await this.storage['get']('current_user');
    if (!currentUser || !currentUser.roles?.includes('petowner')) {
      this.presentToast('Accès refusé : réservé aux petowners', 'danger');
      return;
    }
    const formData = new FormData();
        // Ajout des champs un par un
 const user_id = currentUser.id;
    console.log('▶️ Sending pet_owner_id =', user_id);
    formData.append('pet_owner_id', user_id.toString());  
    formData.append('pet_id', this.newSearch.pet_id);
  formData.append('adresse', this.newSearch.adresse);
  formData.append('description', this.newSearch.description);
  formData.append('care_type', this.newSearch.care_type);
  formData.append('care_duration', this.newSearch.care_duration);
  formData.append('start_date', this.formatDateToYMD(this.newSearch.start_date));
  formData.append('end_date', this.formatDateToYMD(this.newSearch.end_date));
  formData.append('expected_services', this.newSearch.expected_services);
  formData.append('remunerationMin', String(this.newSearch.remunerationMin));
formData.append('remunerationMax', String(this.newSearch.remunerationMax));

  
 

  formData.append('latitude', this.newSearch.latitude);
  formData.append('longitude', this.newSearch.longitude);
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
  showDatePicker: boolean = false; 
  onDateSelected(event: any) {
  this.newSearch.start_date = event.detail.value;
    this.newSearch.end_date = event.detail.value;

  this.showDatePicker = false;
}

// Pour afficher une date formatée dans le champ
formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(); // ou d.toISOString().slice(0, 10)
}

}
