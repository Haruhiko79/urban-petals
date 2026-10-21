import { Component, inject } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonContent, IonIcon } from '@ionic/angular';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  bagHandleOutline, hardwareChipOutline, leafOutline, notificationsOutline, phonePortraitOutline,
  pricetagsOutline, pulseOutline, shieldCheckmarkOutline,
} from 'ionicons/icons';
import { SiteHeaderComponent } from './site-header.component';

interface ContentSection {
  title: string;
  body: string;
  image?: string;
  icon?: string;
  link?: { label: string; path: string };
  chips?: string[];
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  tags?: string[];
}

@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.scss'],
  imports: [SiteHeaderComponent, IonButton, IonCard, IonCardContent, IonContent, IonIcon, RouterLink],
})
export class ContentPageComponent {
  private static readonly ICONS = {
    bagHandleOutline, hardwareChipOutline, leafOutline, notificationsOutline, phonePortraitOutline,
    pricetagsOutline, pulseOutline, shieldCheckmarkOutline,
  };

  private readonly route = inject(ActivatedRoute);
  readonly page = this.route.snapshot.data;
  readonly iconNames = Object.keys(ContentPageComponent.ICONS);

  constructor() {
    addIcons(ContentPageComponent.ICONS);
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('');
  }

  avatarColor(name: string): string {
    const palette = ['#4caf78', '#6e8b62', '#8fbc6a', '#2e5f2e', '#5d7fbb'];
    let hash = 0;
    for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) % 997;
    return palette[hash % palette.length];
  }
}
