import { Component, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SiteHeaderComponent } from './site-header.component';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
  imports: [SiteHeaderComponent, TitleCasePipe, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar, RouterLink],
})
export class AdminPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly view = this.route.snapshot.data['view'] as string;
}
