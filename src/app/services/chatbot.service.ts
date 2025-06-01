import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:11434/api/generate';
  private api = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  sendMessage(message: string) {
    const body = {
    model: 'phi',
    prompt: `You are PetBot, a friendly and helpful pet care assistant. You answer pet care and pet sitting questions clearly, briefly, and **without logic puzzles, proofs, or explanations**. Your answers are practical, concise, and pet-focused. 

    User: ${message}
    PetBot:`,
      stream: false
    };

    return this.http.post(this.apiUrl, body);
  }
  getPetBotMessages() {
    return this.http.get(`${this.api}/api/petbot/messages`);
  }

  savePetBotMessage(message: { sender: string, content: string }) {
    return this.http.post(`${this.api}/api/petbot/messages`, message);
  }
}