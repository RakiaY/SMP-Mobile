import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private ollamaUrl = 'http://localhost:11434/api/generate'; // Ollama endpoint
  private backendUrl = 'http://127.0.0.1:8000'; // Backend Laravel

  constructor(private http: HttpClient) {}

  sendMessage(message: string) {
    const prompt = `
Tu es PetBot, un assistant expert en soins d'animaux. Réponds uniquement en français et uniquement aux questions sur les animaux (chiens, chats, lapins, poissons, oiseaux). Tes réponses doivent être claires, courtes, pratiques et sans politesse inutile.

Question : ${message}
Réponse :
`.trim();

    const body = {
      model: 'OpenLLM-France/Lucie-7B-Instruct',
      prompt,
      stream: false,
    };

    console.log('Envoi du message à Ollama :', body);

    return this.http.post(this.ollamaUrl, body).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de l\'appel à Ollama :', error);
        return throwError(() => new Error('Erreur réseau ou serveur'));
      })
    );
  }

  getPetBotMessages() {
    console.log('Récupération des messages depuis le backend...');
    return this.http.get(`${this.backendUrl}/api/petbot/messages`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la récupération des messages :', error);
        return throwError(() => new Error('Erreur lors de la récupération des messages'));
      })
    );
  }

  savePetBotMessage(message: { sender: string; content: string }) {
    console.log('Sauvegarde du message sur le backend :', message);
    return this.http.post(`${this.backendUrl}/api/petbot/messages`, message).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la sauvegarde du message :', error);
        return throwError(() => new Error('Erreur lors de la sauvegarde du message'));
      })
    );
  }
}
