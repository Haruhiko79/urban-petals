import { Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page.component';
import { AuthPageComponent } from './auth-page.component';
import { ContentPageComponent } from './content-page.component';
import { BlogPageComponent } from './blog-page.component';
import { ContactPageComponent } from './contact-page.component';
import { HelpPageComponent } from './help-page.component';
import { adminGuard } from './admin.guard';

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
  { path: 'about-products', component: ContentPageComponent, data: { eyebrow: 'OUR PRODUCTS', title: 'Everything for<br /><em>your kind of green.</em>', intro: 'Five curated collections, chosen to keep city gardens thriving all year round.', image: 'https://gardenia.net/wp-content/uploads/2023/05/types-of-flowers.webp', chips: [{ label: 'Collections', value: '5' }, { label: 'Delivery', value: 'Nationwide' }, { label: 'New arrivals', value: 'Weekly' }], sections: [{ title: 'Plants & Flowers', body: 'Low-maintenance indoor picks like snake plants and pothos, plus seasonal blooms such as sunflowers, roses and orchids — hand-selected for small spaces.', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=900&q=80', chips: ['Snake plants', 'Pothos', 'Sunflowers', 'Orchids'], link: { label: 'Shop plants & flowers', path: '/tabs/tab2' } }, { title: 'Garden Tools', body: 'Watering cans, shears, trowels and more. Professional-grade tools that make everyday care quick and satisfying.', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80', chips: ['Shears', 'Trowels', 'Watering cans'], link: { label: 'Shop tools', path: '/tabs/tab2?category=Tools' } }, { title: 'Pots', body: 'Ceramic, fiberglass and terracotta planters to match your plants and your space, from desktop pots to tall outdoor statements.', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&q=80', chips: ['Ceramic', 'Terracotta', 'Fiberglass'], link: { label: 'Shop pots', path: '/tabs/tab2?category=Pots' } }, { title: 'Fertilizers', body: 'Organic compost, liquid feeds, slow-release granules and soil enhancers that keep growth steady and blooms generous.', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&q=80', chips: ['Compost', 'Liquid feed', 'Slow release'], link: { label: 'Shop fertilizers', path: '/tabs/tab2?category=Fertilizers' } }] } },
  { path: 'about-app', component: ContentPageComponent, data: { eyebrow: 'ABOUT THE APP', title: 'Your garden,<br /><em>in your pocket.</em>', intro: 'Urban Petals is a mobile-first storefront built with Ionic and Capacitor for Android.', chips: [{ label: 'Framework', value: 'Ionic' }, { label: 'Backend', value: 'Supabase' }, { label: 'Mobile', value: 'Android' }], sections: [{ title: 'Shop anywhere', body: 'Browse five collections, search instantly and build your bag on any screen size — phone, tablet or desktop.', icon: 'phone-portrait-outline', chips: ['Live search', 'Category filters'] }, { title: 'Track every step', body: 'Register once, follow your orders from pending to delivered, and keep your delivery details saved for one-tap checkout.', icon: 'notifications-outline', chips: ['Status updates', 'Full history'] }, { title: 'Real-time availability', body: 'Stock levels come straight from the store database, so what you see is what is actually available.', icon: 'pulse-outline', chips: ['Live stock', 'Safe checkout'] }] } },
  { path: 'developers', component: ContentPageComponent, data: { eyebrow: 'THE TEAM', title: 'The people<br /><em>behind the petals.</em>', intro: 'Urban Petals is built by a small team of developers who love plants as much as code.', team: [{ name: 'Team Member 1', role: 'Frontend & Mobile', bio: 'Designs and builds the Ionic Angular storefront, keeps every screen fast and accessible on Android.', tags: ['Ionic', 'Angular', 'Capacitor'] }, { name: 'Team Member 2', role: 'Backend & Database', bio: 'Builds the Supabase catalog, authentication and order pipeline with row-level security throughout.', tags: ['Supabase', 'PostgreSQL', 'RLS'] }, { name: 'Team Member 3', role: 'Quality & Administration', bio: 'Maintains the protected admin dashboard for orders, products and accounts, and keeps releases reliable.', tags: ['Testing', 'Admin tools', 'CI builds'] }], sections: [{ title: 'Frontend & Mobile', body: 'Ionic Angular storefront with Capacitor packaging, designed mobile-first for the way customers actually shop.', icon: 'phone-portrait-outline', chips: ['Ionic Angular', 'Capacitor'] }, { title: 'Backend & Database', body: 'Supabase-powered catalog, authentication and order pipeline with row-level security throughout.', icon: 'shield-checkmark-outline', chips: ['Supabase', 'PostgreSQL'] }, { title: 'Administration', body: 'A protected admin dashboard for orders, products and accounts so the store team can work without leaving the app.', icon: 'pricetags-outline', chips: ['Guarded routes', 'Live data'] }] } },
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
  { path: 'admin/dashboard', canActivate: [adminGuard], loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'admin/orders', canActivate: [adminGuard], loadComponent: () => import('./admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
  { path: 'admin/products', canActivate: [adminGuard], loadComponent: () => import('./admin-products/admin-products.component').then(m => m.AdminProductsComponent) },
  { path: 'admin/accounts', canActivate: [adminGuard], loadComponent: () => import('./admin-accounts/admin-accounts.component').then(m => m.AdminAccountsComponent) },
  {
    path: 'product/:id',
    loadComponent: () => import('./product-details/product-details.page').then((m) => m.ProductDetailsPage),
  },
  {
    path: 'product-details/:id',
    loadComponent: () => import('./product-details/product-details.page').then((m) => m.ProductDetailsPage),
  },
];

