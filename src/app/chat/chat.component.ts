// src/app/chat/chat.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  IonicModule,
  IonContent
} from '@ionic/angular';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { ActivatedRoute }    from '@angular/router';

import { ChatService, Message } from '../services/chat-service.service';
import { EchoService }          from '../services/echo.service';
import { AuthService }          from '../services/auth.service';

interface ChatMessage {
  text:      string;
  fromMe:    boolean;
  timestamp: string;
  user:      any;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  messages: ChatMessage[] = [];
  newMsg = '';

  private threadId!: number;
  private currentUserId!: number;

  constructor(
    private route:    ActivatedRoute,
    private chatSvc:  ChatService,
    private echoSvc:  EchoService,
    private authSvc:  AuthService
  ) {}

  async ngOnInit() {
    // 1) get threadId from URL
    this.threadId = +this.route.snapshot.paramMap.get('threadId')!;

    // 2) load logged-in user id
    const user = await this.authSvc.getCurrentUser();
    this.currentUserId = user?.id;

    // 3) fetch history & scroll
    this.loadMessages();

    // 4) listen for new messages
    this.subscribeToNewMessages();
  }

  ngOnDestroy() {
    // leave the channel when component is destroyed
    this.echoSvc.echo.leave(`chat.${this.threadId}`);
  }

  private loadMessages() {
    this.chatSvc.messages(this.threadId).subscribe(msgs => {
      // API returns newest-first (because of ->latest()), so reverse it
      const chronological = [...msgs].reverse();
      this.messages = chronological.map(m => this.toChatMessage(m));
      setTimeout(() => this.content.scrollToBottom(300), 100);
    });
  }

  private subscribeToNewMessages() {
    this.echoSvc.echo
      .private(`chat.${this.threadId}`)
      .listen('MessageSent', (e: any) => {
        const chatMsg = this.toChatMessage(e.message as Message);
        this.messages.push(chatMsg);
        setTimeout(() => this.content.scrollToBottom(300), 100);
      });
  }

  sendMessage() {
    const body = this.newMsg.trim();
    if (!body) return;

    this.chatSvc.send(this.threadId, body).subscribe(m => {
      this.messages.push(this.toChatMessage(m));
      this.newMsg = '';
      setTimeout(() => this.content.scrollToBottom(300), 100);
    });
  }

  private toChatMessage(m: Message): ChatMessage {
    return {
      text:      m.body,
      fromMe:    m.user.id === this.currentUserId,
      timestamp: new Date(m.created_at)
                    .toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      user:      m.user
    };
  }
}
