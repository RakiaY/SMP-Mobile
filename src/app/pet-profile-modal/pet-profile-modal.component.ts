import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
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

  pet: any = {}; // We'll fill this with API response

  constructor(
    private petService: PetService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadPet();
  }

  private loadPet() {
    this.petService.getPetById(this.petId).subscribe({
      next: (response) => {
        this.pet = response.pet; // Your API sends { pet: { ... } }
      },
      error: (err) => console.error('Erreur fetching pet:', err),
    });
  }

  getPetPhotoUrl(photoProfil: string | null): string {
    return photoProfil
      ? `http://localhost:8000/storage/${photoProfil}`
      : 'assets/default-pet.jpg'; // default fallback
  }

  close() {
    this.modalCtrl.dismiss();
  }

  get age(): number | null {
    if (!this.pet.birth_date) return null;
    const birth = new Date(this.pet.birth_date);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    return years;
  }
}
