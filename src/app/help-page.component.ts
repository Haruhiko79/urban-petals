import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from './site-header.component';

interface Faq { question: string; answer: string; }
@Component({ selector: 'app-help-page', templateUrl: './help-page.component.html', styleUrls: ['./help-page.component.scss'], imports: [SiteHeaderComponent, FormsModule, IonContent, IonInput, RouterLink] })
export class HelpPageComponent {
  searchTerm = '';
  openQuestion: string | null = null;
  readonly faqs: Faq[] = [
    { question: 'How do I track my order?', answer: 'Once your order ships, you will receive an email with a tracking number. Delivery typically takes 3-7 business days.' },
    { question: 'What is your return policy?', answer: 'We accept returns within 7 days for damaged or incorrect items. Contact support with photos for a replacement or refund.' },
    { question: 'Do you ship nationwide?', answer: 'Yes. We ship to major cities and provinces in the Philippines. Shipping fees are calculated at checkout.' },
    { question: 'How do I care for my new plant?', answer: 'Start with the light and watering guidance included with your plant. Bright indirect light and consistent care are a good default.' },
    { question: 'What payment methods do you accept?', answer: 'Checkout supports the payment options shown at the time of purchase.' },
  ];
  get visibleFaqs(): Faq[] { const query = this.searchTerm.trim().toLowerCase(); return this.faqs.filter((faq) => !query || `${faq.question} ${faq.answer}`.toLowerCase().includes(query)); }
  toggle(question: string): void { this.openQuestion = this.openQuestion === question ? null : question; }
}
