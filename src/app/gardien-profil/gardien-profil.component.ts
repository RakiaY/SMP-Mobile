import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';  
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-gardien-profil',
  imports: [
    CommonModule,
    IonicModule,  
    RouterModule 
  ],
  templateUrl: './gardien-profil.component.html',
  styleUrls: ['./gardien-profil.component.scss'],
})
export class gardienProfilComponent  implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('gardien-profil loaded');
  }
  navigateTo(path: string) {
    console.log(`Naviguer vers ${path}`);
    this.router.navigate([path]);
  }
}

