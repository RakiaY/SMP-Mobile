// src/app/chat-list/chat-list.component.ts

import { Component, OnInit } from '@angular/core';
import { IonicModule }       from '@ionic/angular';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';

import { AuthService }       from '../services/auth.service';
import { ChatService }       from '../services/chat-service.service';

interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  profilePictureURL?: string;
}

interface MessagePreview {
  body:       string;
  created_at: string;
}

/**
 * We made otherParticipant and unreadCount non-optional
 * because our mapping logic always assigns them.
 */
export interface ChatThread {
  id: number;
  participants: Participant[];
  messages: MessagePreview[];
  otherParticipant: Participant;
  unreadCount: number;
}

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit {
  threads: ChatThread[] = [];
  currentUserId!: number;

  constructor(
    private authSvc: AuthService,
    private chatSvc: ChatService
  ) {}

  async ngOnInit() {
    // 1) Load the current user's ID
    const user = await this.authSvc.getCurrentUser();
    this.currentUserId = user?.id;

    // 2) Fetch raw threads from the ChatService (typed as any[] for now)
    this.chatSvc.threads().subscribe((threads: any[]) => {
      // 3) Map each raw thread → ChatThread
      this.threads = threads.map((t: any) => {
        // Find the “other” participant whose id is not the currentUserId
        const other = (t.participants as Participant[]).find(
          (p: Participant) => p.id !== this.currentUserId
        )!;

        return {
          id: t.id,
          participants: t.participants as Participant[],
          messages: t.messages as MessagePreview[],
          otherParticipant: other,
          // If your API provides unread_count, replace 0 with t.unread_count
          unreadCount: 0
        };
      });
    });
  }
}
