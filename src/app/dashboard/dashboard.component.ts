import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule,Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [IonicModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
})
export class DashboardComponent  implements OnInit {

  constructor(private router: Router) { }
    ngOnInit(): void {
      // Initialisation si nécessaire
      console.log('Dashboard loaded');
    }
    navigateTo(path: string): void {
      this.router.navigateByUrl(path);
}
}


