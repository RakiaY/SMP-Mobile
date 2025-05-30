import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PetService } from '../services/pet.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './pets.page.html',
  styleUrls: ['./pets.page.scss'],
})
export class PetsPage implements OnInit {
  Pets: any[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private petService: PetService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    const user = await this.auth.getCurrentUser();
    if (user?.id) {
      this.petService.getPetsByOwner(user.id).subscribe({
        next: (pets) => (this.Pets = pets),
        error: (err) =>
          console.error('Erreur de chargement des animaux:', err),
      });
    } else {
      console.warn("Aucun utilisateur connecté.");
    }
  }

  goToAdd() {
    this.router.navigateByUrl('/pets/add');
  }

  editPet(petId: number) {
    this.router.navigateByUrl(`/pets/edit/${petId}`);
  }

  deletePet(petId: number, index: number) {
    if (!confirm("Voulez-vous vraiment supprimer cet animal ?")) {
      return;
    }
    this.petService.deletePet(petId).subscribe({
      next: () => {
        // remove from the UI list
        this.Pets.splice(index, 1);
      },
      error: (err) =>
        console.error(`Erreur lors de la suppression du pet ${petId}:`, err),
    });
  }

  getPetPhotoUrl(photoProfil: string | null): string {
    return photoProfil
      ? `http://localhost:8000/storage/${photoProfil}`
      : 'assets/default-pet.png';
  }

  getSanitizedImageUrl(photo_profil: string): SafeResourceUrl {
    const url = 'http://localhost:8000/storage/' + photo_profil;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
