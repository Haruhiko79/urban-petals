import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonInput, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular';
import { SiteHeaderComponent } from './site-header.component';
import { SupabaseService } from './services/supabase.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss'],
  imports: [SiteHeaderComponent, FormsModule, IonButton, IonContent, IonInput, IonSelect, IonSelectOption, IonTextarea],
})
export class ContactPageComponent {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  subject = '';
  message = '';
  private readonly supabase = inject(SupabaseService);
  private readonly api = inject(ApiService);
  readonly sent = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');

  async submit(): Promise<void> {
    if (this.busy() || !this.firstName.trim() || !this.email.trim() || !this.subject || !this.message.trim()) return;
    this.busy.set(true);
    this.error.set('');

    try {
      if (this.supabase.isConfigured) {
        const { error } = await this.supabase.client.from('contact_messages').insert({
          first_name: this.firstName.trim(),
          last_name: this.lastName.trim(),
          email: this.email.trim(),
          phone: this.phone.trim(),
          subject: this.subject,
          message: this.message.trim(),
        });

        if (error) throw new Error(error.message);

        this.sent.set(true);
        this.firstName = this.lastName = this.email = this.phone = this.subject = this.message = '';
      } else {
        const result = await this.api.request<{ success: boolean }>('/contact', 'POST', {
          firstName: this.firstName.trim(),
          lastName: this.lastName.trim(),
          email: this.email.trim(),
          phone: this.phone.trim(),
          subject: this.subject,
          message: this.message.trim(),
        });
        if (result.success !== true) throw new Error('Your message could not be confirmed. Please try again.');
        this.sent.set(true);
        this.firstName = this.lastName = this.email = this.phone = this.subject = this.message = '';
      }
    } catch (error) {
      this.error.set((error as Error).message);
    } finally {
      this.busy.set(false);
    }
  }
}
