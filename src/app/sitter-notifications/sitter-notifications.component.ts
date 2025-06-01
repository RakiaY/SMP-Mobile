import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sitter-notifications',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './sitter-notifications.component.html',
  styleUrls: ['./sitter-notifications.component.scss']
})
export class SitterNotificationsComponent implements OnInit {
  notifications: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.http.get<any[]>('http://localhost:8000/api/sitter-notifications').subscribe({
      next: data => {
        this.notifications = data;
      },
      error: err => {
        console.error('Error loading sitter notifications', err);
      }
    });
  }
}
