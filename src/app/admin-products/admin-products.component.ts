import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../site-header.component';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, SiteHeaderComponent, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, RouterLink],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./products.css']
})
export class AdminProductsComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  products = signal<any[]>([]);

  async ngOnInit(): Promise<void> {
    if (!this.supabase.isConfigured) return;
    try {
      const { data } = await this.supabase.client.from('products').select('*').order('id', { ascending: true });
      this.products.set(data || []);
    } catch (e) {}
  }
}

