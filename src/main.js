import { ChatWidget } from './chat-widget.js';
import './chat-widget.css';
import '../src/app.css';

// Initialize chat widget
const chatContainer = document.getElementById('chat-widget');
if (chatContainer) {
  new ChatWidget(chatContainer);
}
