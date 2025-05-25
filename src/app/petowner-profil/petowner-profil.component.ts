import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';  
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-petowner-profil',
  imports: [
    CommonModule,
    IonicModule,  
    RouterModule  
  ],
  templateUrl: './petowner-profil.component.html',
  styleUrls: ['./petowner-profil.component.scss'],
})
export class PetownerProfilComponent  implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('petowner-profil loaded');
  }
  navigateTo(path: string) {
    console.log(`Naviguer vers ${path}`);
    this.router.navigate([path]);
  }
}

