import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sitter-profile-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './sitter-profile-modal.component.html',
  styleUrls: ['./sitter-profile-modal.component.scss']
})
export class SitterProfileModalComponent implements OnInit {
  @Input() sitterId!: number;
  sitter: any;
  loading = true;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadSitter();
  }

  loadSitter() {
    this.http.get<any>(`http://localhost:8000/api/petsitter/${this.sitterId}`).subscribe({
      next: data => {
        this.sitter = data.petSitter; // Access the resource in the response
        this.loading = false;
      },
      error: err => {
        console.error('Error loading sitter profile', err);
        this.loading = false;
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  getProfilePhoto() {
    return this.sitter?.profilePictureURL 
      ? `http://localhost:8000/storage/${this.sitter.profilePictureURL}` 
      : 'assets/default-avatar.png';
  }
}
