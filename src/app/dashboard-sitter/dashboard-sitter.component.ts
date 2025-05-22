import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface PetOwnerRequest {
  ownerId: number;
  petId: number;
  price: number;
  ownerName: string;
  animalName: string;
  species: string;
  address: string;
  careType: 'chez_proprietaire' | 'chez_garde';
  duration: string;
  startDate: Date;
  endDate: Date;
  liked: boolean;
  petted: boolean;
}

@Component({
  selector: 'app-dashboard-sitter',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './dashboard-sitter.component.html',
  styleUrls: ['./dashboard-sitter.component.scss'],
})
export class DashboardSitterComponent implements OnInit {
  petOwnerRequests: PetOwnerRequest[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.petOwnerRequests = [
      {
        ownerId: 1,
        petId: 42,
        ownerName: 'khelifa Hamza',
        animalName: 'Maya',
        species: 'Chien',
        address: 'Avenue Boutroux, Paris, France',
        careType: 'chez_proprietaire',
        duration: '5 jours',
        price: 50,
        startDate: new Date(2025, 4, 25),
        endDate: new Date(2025, 4, 30),
        liked: false,
        petted: false
      },
      {
        ownerId: 1,
        petId: 42,
        ownerName: 'khelifa Hamza',
        animalName: 'Maya',
        species: 'Chien',
        address: 'Avenue Boutroux, Paris, France',
        careType: 'chez_proprietaire',
        duration: '5 jours',
        price: 50,
        startDate: new Date(2025, 4, 25),
        endDate: new Date(2025, 4, 30),
        liked: false,
        petted: false
      },
      {
        ownerId: 1,
        petId: 42,
        ownerName: 'khelifa Hamza',
        animalName: 'Maya',
        species: 'Chien',
        address: 'Avenue Boutroux, Paris, France',
        careType: 'chez_proprietaire',
        duration: '5 jours',
        price: 50,
        startDate: new Date(2025, 4, 25),
        endDate: new Date(2025, 4, 30),
        liked: false,
        petted: false
      },
      // … add more requests as needed …
    ];
  }

  viewOwner(req: PetOwnerRequest) {
    this.router.navigate(['/owner-profile', req.ownerId]);
  }

  viewPet(req: PetOwnerRequest) {
    // toggle 'petted' to color the icon
    req.petted = !req.petted;
    this.router.navigate(['/pet-profile', req.petId]);
  }

  toggleLike(req: PetOwnerRequest) {
    req.liked = !req.liked;
    // TODO: hook into your notification/chat service
    console.log(`Request ${req.petId} liked?`, req.liked);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
