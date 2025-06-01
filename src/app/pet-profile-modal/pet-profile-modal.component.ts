import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, IonAvatar } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PetService } from '../services/pet.service';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule],
  selector: 'app-pet-profile-modal',
  templateUrl: './pet-profile-modal.component.html',
  styleUrls: ['./pet-profile-modal.component.scss'],
})
export class PetProfileModalComponent implements OnInit {
  @Input() petId!: number;

  pet: {
    name: string;
    type: string;
    breed: string;
    gender: string;
 birth_date: string | null;
     weight: number | null;
    taille: string;
    is_vaccinated: boolean | null;
    has_contagious_disease: boolean | null;
    has_medical_file: boolean | null;
    is_critical_condition: boolean | null;
    photo_profil: string | null;
    description?: string;
  } = {
    name: '',
    type: '',
    breed: '',
    gender: '',
    birth_date: null,
    weight: null,
    taille: '',
    is_vaccinated: null,
    has_contagious_disease: null,
    has_medical_file: null,
    is_critical_condition: null,
    photo_profil: null,
  };
  get age(): number | null {
    if (!this.pet.birth_date) {
      return null;
    }
    const birth = new Date(this.pet.birth_date);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      years--;
    }
    return years;
  }

  constructor(
    private petService: PetService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadPet();
  }

  private loadPet() {
    this.petService.getPetById(this.petId).subscribe({
      next: pet => this.pet = pet,
      error: err => console.error('Erreur fetching pet:', err)
    });
  }
  
getPetPhotoUrl(photoProfil: string | null): string {

  return `http://localhost:8000/storage/${photoProfil}`;
}

  close() {
    this.modalCtrl.dismiss();
  }
}
