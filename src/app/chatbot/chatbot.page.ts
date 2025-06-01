import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ChatService } from '../services/chatbot.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule, IonicModule],
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
})
export class ChatBotPage implements OnInit {
  @ViewChild('chatMessages', { static: false }) chatMessagesRef!: ElementRef;

  userInput = '';
  messages: any[] = [];
  loading = false;

  constructor(private chatService: ChatService) {}

  ngAfterViewInit() {
    this.scrollToBottom();
  }
  ngOnInit() {
    this.chatService.getPetBotMessages().subscribe(
      (res: any) => {
        this.messages = res.map((msg: any) => ({
          sender: msg.sender,
          text: msg.content,
        }));
        this.scrollToBottom();
      },
      (err) => {
        console.error('Error loading messages:', err);
      }
    );
  }

  getAvatarIcon(sender: string) {
    return sender === 'bot' ? '🐾' : '🐶';
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMsg = this.userInput.trim();
    this.messages.push({ sender: 'user', text: userMsg });
    this.chatService.savePetBotMessage({ sender: 'user', content: userMsg }).subscribe();
    this.userInput = '';
    this.loading = true;

    this.scrollToBottom();

    this.chatService.sendMessage(userMsg).subscribe(
      (res: any) => {
        let aiReply = '';

        if (Array.isArray(res) && res[0]?.generated_text) {
          aiReply = res[0].generated_text;
        } else if (res?.data?.[0]) {
          aiReply = res.data[0];
        } else if (res?.response) {
          aiReply = res.response;
        } else if (typeof res === 'string') {
          aiReply = res;
        } else {
          aiReply = 'Sorry, I did not understand.';
        }

        this.messages.push({ sender: 'bot', text: aiReply });
        this.chatService.savePetBotMessage({ sender: 'bot', content: aiReply }).subscribe();
        this.loading = false;
        this.scrollToBottom();
      },
      (err) => {
        console.error('Error:', err);
        this.messages.push({ sender: 'bot', text: 'Error communicating with AI.' });
        this.loading = false;
        this.scrollToBottom();
      }
    );
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatMessagesRef?.nativeElement) {
        const chatContainer = this.chatMessagesRef.nativeElement;
        chatContainer.scrollTop = chatContainer.scrollHeight + 100;
      }
    }, 100);
  }
}
