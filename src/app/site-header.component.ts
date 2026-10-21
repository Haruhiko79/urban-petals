import { Component, input } from '@angular/core';
import { IonBackButton, IonButtons, IonHeader, IonMenuButton, IonToolbar } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss'],
  imports: [IonBackButton, IonButtons, IonHeader, IonMenuButton, IonToolbar, RouterLink],
})
export class SiteHeaderComponent {
  readonly back = input(false);
}
