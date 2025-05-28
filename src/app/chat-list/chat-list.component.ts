import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ChatThread {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl: string;
  unreadCount?: number;
}

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent {
  threads: ChatThread[] = [
    {
      id: 1,
      name: 'Alice Dupont',
      lastMessage: 'Bonjour ! Je confirme la garde pour samedi.',
      timestamp: '10:15',
      avatarUrl: '/assets/avatar1.png',
      unreadCount: 2
    },
    {
      id: 2,
      name: 'Sophie Martin',
      lastMessage: 'Merci pour votre retour.',
      timestamp: '09:50',
      avatarUrl: '/assets/avatar2.png'
    },
    {
      id: 3,
      name: 'Marc Leroy',
      lastMessage: 'Où puis-je trouver votre adresse exacte ?',
      timestamp: 'Hier',
      avatarUrl: '/assets/avatar3.png',
      unreadCount: 1
    }
  ];
}
