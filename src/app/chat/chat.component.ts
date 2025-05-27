import { Component } from '@angular/core';
import { IonicModule, IonBackButton, IonButtons, } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  text: string;
  fromMe: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  messages: Message[] = [
    { text: 'Bonjour, comment puis-je vous aider aujourd’hui ?', fromMe: false, timestamp: '11:00' },
    { text: 'Je voudrais garder mon chien ce weekend.',           fromMe: true,  timestamp: '11:02' }
  ];
  newMsg: string = '';

  sendMessage() {
    const txt = this.newMsg.trim();
    if (!txt) { return; }
    this.messages.push({
      text: txt,
      fromMe: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.newMsg = '';
    // TODO: scroll to bottom
  }
}
