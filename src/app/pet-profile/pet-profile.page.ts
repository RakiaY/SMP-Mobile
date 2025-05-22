import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ToastController } from '@ionic/angular';
import { PetService } from '../services/pet.service';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  templateUrl: './pet-profile.page.html',
  styleUrls: ['./pet-profile.page.scss']
})
export class PetProfilePage implements OnInit {
  pet: any = {
    name: '',
    type: '',
    breed: '',
    gender: '',
    birth_date: '',
    weight: null,
    is_vaccinated: null,
    has_contagious_disease: null,
    has_medical_file: null,
    is_critical_condition: null,
    photo_profil: null,
  };
    photo_profil: File | null = null;

  animalBreeds: { [key: string]: string[] } = {
  'Chien': [
    'Labrador',
    'Berger Allemand',
    'Bulldog',
    'Golden Retriever',
    'Beagle',
    'Caniche',
    'Husky',
    'Shih Tzu'
  ],
  'Chat': [
    'Siamois',
    'Persan',
    'Maine Coon',
    'Bengal',
    'Sphynx',
    'Ragdoll'
  ],
  'Lapin': [
    'Holland Lop',
    'Netherland Dwarf',
    'Angora',
    'Rex'
  ],
  'Oiseau': [
    'Perruche',
    'Canari',
    'Calopsitte',
    'Perroquet'
  ],
  'Poisson': [
    'Poisson rouge',
    'Combattant',
    'Guppy',
    'Scalaire'
  ],
  
  'Autre': [
    // Cobaye
    'Abyssin',
    'Angora',
    'Péruvien',
    'Texel',
    'Rex',

    // Furet
    'Albinos',
    'Zibeline',
    'Champagne',
    'Angora',

    // Perroquet
    'Gris du Gabon',
    'Ara bleu',
    'Perruche ondulée',
    'Pionus',
    'Caique',

    // Tortue
    'de Hermann',
    'étoilée',
    'sulcata',
    'boîte d’eau',

    // Serpent
    'Python royal',
    'Couleuvre cornue',
    'Boa constrictor',
    'Couleuvre de Rat',
    'Couleuvre royale',

    // Chinchilla
    'Standard',
    'White mosaic',
    'Ebony',
    'Sapphire',
    'Violet',

    // Souris
    'Fancy mouse',
    'Black mouse',
    'Golden mouse',
    'Dalmatian mouse'
  ]
};

filteredBreeds: string[] = [];
onTypeChange(type: string) {
  this.filteredBreeds = this.animalBreeds[type] || [];
  this.pet.breed = ''; // Réinitialiser la race
}
  types = [
    { value: 'Chien',     label: 'Chien'   },
    { value: 'Chat',     label: 'Chat'    },
    { value: 'Lapin',  label: 'Lapin'   },
    { value: 'Oiseau',  label: 'Oiseau' },
    { value: 'Poisson',    label: 'Poisson' },
    { value: 'Autre',  label: 'Autre'  },
  
  ];
  otherTypes = [
    'Cobaye',
    'Furet',
    'Perroquet',
    'Tortue',
    'Serpent',
    'Chinchilla',
    'Souris',
  ];


  vaccOptions = [
    { value: 1, label: 'Vacciné', icon: 'vacciné.svg' },
    { value: 0, label: 'Non vacciné', icon: 'non_vacciné.svg' },
  ];

  diseaseOptions = [
    { value: 1, label: 'Oui', icon: 'contagious-yes.svg' },
    { value: 0, label: 'Non', icon: 'contagious-no.svg' },
  ];
  medicalFolder = [
    { value: 1, label: 'Oui', icon: 'medicalFolder.png' },
    { value: 0, label: 'Non', icon: 'medicalFolder-no.png' },
  ];
criticalCondition = [
    { value: 1, label: 'Oui', icon: 'Critical-Yes.jpg' },
    { value: 0, label: 'Non', icon: 'Critical-no.jpg' },
  ];
  preview: string | null = null;
  photoFile: File | null = null;
  albumPhotos: File[] = [];
  petTypeOther: string | null = null;

  constructor(
    private storage: Storage,
    private toastCtrl: ToastController,
    private petService: PetService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.storage.create();
  }

 
getBreeds() {
      if (this.pet.type === undefined) {
        return [];
      }
      return this.animalBreeds[this.pet.type] || [];
    }
    
  onPhotoSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.photo_profil = file;
  }
}

  onAlbumPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.albumPhotos = Array.from(input.files);
    }
  }

  async savePet() {
    const currentUser = await this.storage.get('current_user');
    if (!currentUser || !currentUser.roles?.includes('petowner')) {
      this.presentToast('Accès refusé : réservé aux petowners', 'danger');
      return;
    }

    const formData = new FormData();
    const petOwnerId = currentUser.id;
    console.log('▶️ Sending pet_owner_id =', petOwnerId);
    formData.append('pet_owner_id', petOwnerId.toString());
    formData.append('name', this.pet.name || '');
    formData.append('type', this.pet.type || '');

    if (this.pet.type === 'autre') {
      formData.append('type_other', this.petTypeOther || '');
    }

    formData.append('breed', this.pet.breed || '');
    formData.append('size', this.pet.size || '');
    formData.append('gender', this.pet.gender || '');
formData.append('birth_date', this.formatDateToYMD(this.pet.birth_date));
    formData.append('weight', this.pet.weight?.toString() || '');
    formData.append('training', this.pet.training?.toString() || '');
    formData.append('is_vaccinated', String(this.pet.is_vaccinated));
    formData.append('has_contagious_diseases', String(this.pet.has_contagious_disease));
    formData.append('has_medical_file', String(this.pet.has_medical_file));
    formData.append('is_critical_condition', String(this.pet.is_critical_condition));

    if (this.photo_profil) {
    formData.append('photo_profil', this.photo_profil);
  }
    this.albumPhotos.forEach((file) => {
      formData.append('media[]', file); // ✅ repeat for each album image
    });


    this.petService.addPet(formData).subscribe({
      next: () => {
        this.presentToast('Animal ajouté avec succès', 'success');
        this.router.navigate(['/pets']);
      },
      error: (err) => {
        console.error('Erreur ajout animal:', err);
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
  this.pet.birth_date = event.detail.value;
  this.showDatePicker = false;
}

// Pour afficher une date formatée dans le champ
formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(); // ou d.toISOString().slice(0, 10)
}
}
