import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { SitterProfileModalComponent } from '../sitter-profile-modal/sitter-profile-modal.component';


@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];

  constructor(private http: HttpClient, private router: Router, private modalCtrl: ModalController) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.http.get<any[]>('http://localhost:8000/api/notifications').subscribe({
      next: data => {
        this.notifications = data;
      },
      error: err => {
        console.error('Error loading notifications', err);
      }
    });
  }

  goToSitterProfile(sitterId: number) {
    this.router.navigate(['/sitter-profile', sitterId]);
  }

  acceptNotification(notificationId: number) {
    this.http.post(`http://localhost:8000/api/postulation/${notificationId}/accept`, {}).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
      },
      error: err => {
        console.error('Error accepting', err);
      }
    });
  }

  declineNotification(notificationId: number) {
    this.http.post(`http://localhost:8000/api/postulation/${notificationId}/decline`, {}).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
      },
      error: err => {
        console.error('Error declining', err);
      }
    });
  }
  // Open modal
  async openSitterProfile(sitterId: number) {
    const modal = await this.modalCtrl.create({
      component: SitterProfileModalComponent,
      componentProps: { sitterId }
    });
    await modal.present();
  }
}
