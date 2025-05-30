import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  notifications = [
    {
      id: 1,
      sitterId: 101,
      sitterName: 'John Doe',
      message: 'veut postuler pour cette garde.'
    },
    {
      id: 2,
      sitterId: 102,
      sitterName: 'Emma Smith',
      message: 'veut postuler pour cette garde.'
    }
  ];

  constructor(private router: Router) {}

  goToSitterProfile(sitterId: number) {
    this.router.navigate(['/sitter-profile', sitterId]);
  }

  acceptNotification(notificationId: number) {
    console.log(`Accepted notification ${notificationId}`);
    // TODO: Send accept request to backend, then remove from list
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  declineNotification(notificationId: number) {
    console.log(`Declined notification ${notificationId}`);
    // TODO: Send decline request to backend, then remove from list
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }
}
