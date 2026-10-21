import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonSegment, IonSegmentButton, } from '@ionic/angular';
import { SiteHeaderComponent } from './site-header.component';

interface BlogPost { title: string; category: string; date: string; excerpt: string; image: string; }

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrls: ['./blog-page.component.scss'],
  imports: [SiteHeaderComponent, FormsModule, IonContent, IonInput, IonSegment, IonSegmentButton, ],
})
export class BlogPageComponent {
  readonly categories = ['All', 'Plant Care', 'Gardening', 'Home Decor', 'Tips & Tricks', 'Community'];
  readonly posts: BlogPost[] = [
    { title: 'The Ultimate Guide to Watering Your Indoor Plants', category: 'Plant Care', date: 'April 10, 2025', excerpt: 'The simple signals that tell you when a plant needs water, without overwatering it.', image: 'https://cdn.patchplants.com/uploads/16_9_Hero_min_4e8e364864.jpg' },
    { title: 'Make a Balcony Garden That Actually Thrives', category: 'Gardening', date: 'March 28, 2025', excerpt: 'Choose the right plants, light and containers for a small but generous growing space.', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80' },
    { title: 'Pots That Make Your Plants Look Their Best', category: 'Home Decor', date: 'March 12, 2025', excerpt: 'A practical guide to choosing shape, material and scale for your room.', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&q=80' },
    { title: 'Five Tiny Habits for Happier Plants', category: 'Tips & Tricks', date: 'February 20, 2025', excerpt: 'Small routines that keep everyday plant care calm and consistent.', image: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=900&q=80' },
  ];
  searchTerm = '';
  selectedCategory = 'All';

  get visiblePosts(): BlogPost[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.posts.filter((post) => (this.selectedCategory === 'All' || post.category === this.selectedCategory) && (!query || `${post.title} ${post.excerpt}`.toLowerCase().includes(query)));
  }

}
