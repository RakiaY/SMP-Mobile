// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  profilePictureURL?: string;
}

export interface Message {
  id: number;
  body: string;
  created_at: string;
  user: Participant;
}

export interface Thread {
  id: number;
  participants: Participant[];
  messages: Message[];
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private base = 'http://127.0.0.1:8000/api/chat';

  constructor(private http: HttpClient) {}

  threads(): Observable<Thread[]> {
    return this.http.get<Thread[]>(
      `${this.base}/threads`,
    );
  }

  messages(threadId: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.base}/${threadId}/messages`,
    );
  }

  send(threadId: number, body: string): Observable<Message> {
    return this.http.post<Message>(
      `${this.base}/${threadId}/messages`,
      { body },
    );
  }
}
