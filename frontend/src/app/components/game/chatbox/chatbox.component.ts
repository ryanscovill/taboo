import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Message } from 'src/app/models/message.model';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.scss']
})
export class ChatboxComponent implements OnInit {
  @Input() messageList: Message[] = [];
  @Input() height: string = '300px';
  @ViewChild('messageListElement') private scrollContainer: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      setTimeout(() => this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight);
    }
  }

}
