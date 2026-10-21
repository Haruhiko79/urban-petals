import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonAvatar,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bagHandleOutline, callOutline, closeOutline, codeSlashOutline, homeOutline, informationCircleOutline,
  leafOutline, logInOutline, personOutline, peopleOutline, pricetagsOutline, receiptOutline,
  speedometerOutline, timeOutline,
} from 'ionicons/icons';
import { UserProfileService } from './services/user-profile.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  imports: [
    IonAvatar,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonTitle,
    IonToolbar,
    RouterLink,
  ],
})
export class SideMenuComponent {
  readonly profile = inject(UserProfileService).profile;
  readonly isAdmin = computed(() => {
    const role = this.profile()?.role;
    return role === 'admin' || role === 'super_admin';
  });

  constructor() {
    addIcons({
      bagHandleOutline, callOutline, closeOutline, codeSlashOutline, homeOutline, informationCircleOutline,
      leafOutline, logInOutline, personOutline, peopleOutline, pricetagsOutline, receiptOutline,
      speedometerOutline, timeOutline,
    });
  }
}
