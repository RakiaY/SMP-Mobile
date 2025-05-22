import { Component, OnInit } from '@angular/core';
import { IonicModule }   from '@ionic/angular';
import { CommonModule }  from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

import { SearchSitterService } from '../services/search-sitter.service';
import { PetOwnerRequest }     from '../models/pet-owner-request.model';

@Component({
  selector: 'app-dashboard-sitter',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './dashboard-sitter.component.html',
  styleUrls: ['./dashboard-sitter.component.scss'],
})
export class DashboardSitterComponent implements OnInit {
  petOwnerRequests: PetOwnerRequest[] = [];
  loading = true;

  constructor(
    private router: Router,
    private searchService: SearchSitterService
  ) {}

  ngOnInit(): void {
    this.searchService.getRequests().subscribe({
      next: (list) => {
        this.petOwnerRequests = list;
        this.loading = false;
      },
      error: err => {
        console.error('Could not load sitter requests', err);
        this.loading = false;
      }
    });
  }

  viewOwner(req: PetOwnerRequest) {
    this.router.navigate(['/owner-profile', req.ownerId]);
  }

  viewPet(req: PetOwnerRequest) {
    req.petted = !req.petted;
    this.router.navigate(['/pet-profile', req.petId]);
  }

  toggleLike(req: PetOwnerRequest) {
    req.liked = !req.liked;
    // you can post back to server if you like…
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  getStatusColor(status: boolean) {
    return status ? 'success' : 'medium';
  }
}
