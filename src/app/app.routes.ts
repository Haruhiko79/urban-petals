import { Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page.component';
import { AuthPageComponent } from './auth-page.component';
import { ContentPageComponent } from './content-page.component';
import { BlogPageComponent } from './blog-page.component';
import { ContactPageComponent } from './contact-page.component';
import { HelpPageComponent } from './help-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/tabs/tab1', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  { path: 'home', redirectTo: '/tabs/tab1', pathMatch: 'full' },
  { path: 'homepage', redirectTo: '/tabs/tab1', pathMatch: 'full' },
  { path: 'plants', redirectTo: '/tabs/tab2?category=Plants', pathMatch: 'full' },
  { path: 'flowers', redirectTo: '/tabs/tab2?category=Flowers', pathMatch: 'full' },
  { path: 'garden', redirectTo: '/tabs/tab2?category=Tools', pathMatch: 'full' },
  { path: 'pots', redirectTo: '/tabs/tab2?category=Pots', pathMatch: 'full' },
  { path: 'fertilizer', redirectTo: '/tabs/tab2?category=Fertilizers', pathMatch: 'full' },
  { path: 'products', redirectTo: '/tabs/tab2', pathMatch: 'full' },
  { path: 'about', component: ContentPageComponent, data: { eyebrow: 'OUR STORY', title: 'Rooted in a love for green spaces.', intro: 'Urban Petals makes growing feel possible in the middle of city life.', sections: [{ title: 'From a balcony to your doorstep', body: 'We curate plants, tools and objects that help small spaces become places to pause and grow.' }, { title: 'Thoughtful by nature', body: 'Every piece is chosen for usefulness, longevity and the quiet joy it brings home.' }, { title: 'Our promise', body: 'Clear advice, carefully packed plants and support for every stage of your growing journey.' }] } },
  { path: 'blog', component: BlogPageComponent },
  { path: 'contact', component: ContactPageComponent },
  { path: 'help', component: HelpPageComponent },
  { path: 'signin', component: AuthPageComponent, data: { mode: 'signin' } },
  { path: 'register', component: AuthPageComponent, data: { mode: 'register' } },
  { path: 'login', redirectTo: '/signin', pathMatch: 'full' },
  { path: 'signup', redirectTo: '/register', pathMatch: 'full' },
  { path: 'checkout', redirectTo: '/tabs/tab3', pathMatch: 'full' },
  { path: 'receipt', redirectTo: '/tabs/tab3', pathMatch: 'full' },
  { path: 'check-out-new', redirectTo: '/tabs/tab3', pathMatch: 'full' },
  { path: 'receipt-new', redirectTo: '/tabs/tab3', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: '/admin/dashboard', pathMatch: 'full' },
  { path: 'orders', loadComponent: () => import('./orders-page.component').then(m => m.OrdersPageComponent) },
  { path: 'accounts', redirectTo: '/admin/accounts', pathMatch: 'full' },
  { path: 'profile', redirectTo: '/tabs/account', pathMatch: 'full' },
  { path: 'admin/dashboard', loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'admin/orders', loadComponent: () => import('./admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
  { path: 'admin/products', loadComponent: () => import('./admin-products/admin-products.component').then(m => m.AdminProductsComponent) },
  { path: 'admin/accounts', loadComponent: () => import('./admin-accounts/admin-accounts.component').then(m => m.AdminAccountsComponent) },
  {
    path: 'product/:id',
    loadComponent: () => import('./product-details/product-details.page').then((m) => m.ProductDetailsPage),
  },
  {
    path: 'product-details/:id',
    loadComponent: () => import('./product-details/product-details.page').then((m) => m.ProductDetailsPage),
  },
];

