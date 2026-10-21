import { Component, inject } from '@angular/core';
import { IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SiteHeaderComponent } from './site-header.component';

@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.scss'],
  imports: [SiteHeaderComponent, IonButton, IonCard, IonCardContent, IonContent, RouterLink],
})
export class ContentPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly page = this.route.snapshot.data;
}
