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
    size: '',
    gender: '',
    birth_date: '',
    weight: null,
    training: 1,
    is_vaccinated: null,
    has_contagious_disease: null,
  };

  types = [
    { value: 'dog', label: 'Chien' },
    { value: 'cat', label: 'Chat' },
    { value: 'rabbit', label: 'Lapin' },
    { value: 'bird', label: 'Oiseau' },
    { value: 'fish', label: 'Poisson' },
    { value: 'autre', label: 'Autre' },
  ];

  otherTypes = ['Hamster', 'Cobaye', 'Furet', 'Perroquet', 'Tortue', 'Chinchilla'];

  animalBreeds: { [key: string]: string[] } = {
    dog: ['Labrador', 'Golden Retriever', 'Bulldog', 'Beagle'],
    cat: ['Siamois', 'Persan', 'Bengal', 'Maine Coon'],
    rabbit: ['Nain', 'Angora', 'Himalaya'],
    bird: ['Perroquet', 'Canari', 'Perruche'],
    fish: ['Guppy', 'Betta', 'Goldfish'],
    autre: this.otherTypes,
  };

  vaccOptions = [
    { value: 1, label: 'Vacciné', icon: 'vacciné.svg' },
    { value: 0, label: 'Non vacciné', icon: 'non_vacciné.svg' },
  ];

  diseaseOptions = [
    { value: 1, label: 'Oui', icon: 'contagious-yes.svg' },
    { value: 0, label: 'Non', icon: 'contagious-no.svg' },
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

  getBreeds(): string[] {
    return this.pet.type ? this.animalBreeds[this.pet.type] || [] : [];
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.photoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.preview = reader.result as string);
      reader.readAsDataURL(this.photoFile);
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
    formData.append('birth_date', this.pet.birth_date || '');
    formData.append('weight', this.pet.weight?.toString() || '');
    formData.append('training', this.pet.training?.toString() || '');
    formData.append('is_vaccinated', String(this.pet.is_vaccinated));
    formData.append('has_contagious_diseases', String(this.pet.has_contagious_disease));

    if (this.photoFile) {
    formData.append('media[]', this.photoFile); // ✅ matches backend
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
}
