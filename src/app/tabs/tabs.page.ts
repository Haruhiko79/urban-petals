import { Component, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, leafOutline, bagHandleOutline, personOutline } from 'ionicons/icons';
import { ShopService } from '../shop.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
})
export class TabsPage {
  readonly shop = inject(ShopService);

  constructor() {
    addIcons({ homeOutline, leafOutline, bagHandleOutline, personOutline });
  }
}
