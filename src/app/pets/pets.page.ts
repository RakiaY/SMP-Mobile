import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AnimalService, Animal } from '../services/animal.service';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PetService } from '../services/pet.service';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './pets.page.html',
  styleUrls: ['./pets.page.scss'],
})
// src/app/pets/pets.page.ts
export class PetsPage implements OnInit {
  animals: Animal[] = [];
      Pets: any[] = [];


  constructor(
    private animalService: AnimalService,
    private router: Router,
        private auth:AuthService,
            private petService: PetService,

    
  ) {}

   async ngOnInit() {
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

  goToAdd() {
    this.router.navigateByUrl('/pets/add');
  }
  
editPet(petId: number) {
  this.router.navigateByUrl(`/pets/edit/${petId}`);
}

  /** Supprimer après confirmation */
  deleteAnimal(i: number) {
    if (confirm('Voulez‑vous vraiment supprimer cet animal ?')) {
      this.animalService.removeAnimal(i);
    }
  }

  /** Modifier via de simples prompts (ou rediriger vers un formulaire pré‑rempli) */
  editAnimal(i: number) {
    const current = this.animals[i];
    const newName = prompt('Modifier le nom', current.name);
    if (newName === null) return; // annulation

    const newDesc = prompt('Modifier la description', current.description);
    if (newDesc === null) return;

    this.animalService.updateAnimal(i, {
      ...current,
      name: newName,
      description: newDesc
    });
  }
}
