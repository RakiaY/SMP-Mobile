import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

@Injectable({ providedIn: 'root' })
export class EchoService {
  public echo: Echo<any>;

  constructor() {
    this.echo = new Echo({
      broadcaster: 'pusher',
      key:        'b6a1b344d6d2f1a159bd',
      cluster:    'mt1',
      forceTLS:   true,
      // if you’re using token-auth, you may need to pass auth headers:
      authEndpoint:  'http://127.0.0.1:8000/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    } as any);
  }
}
