import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  images: string[] = [
    '/mecanica.jpg',
    '/fondodim.png',
    '/mecanica2.jpg',
    '/MARSINO_ARQUITECTOS_LABIM_11L.png',
    '/MARSINO_ARQUITECTOS_LABIM_18L.png',
    '/MARSINO_ARQUITECTOS_LABIM_21L.png',
    '/MARSINO_ARQUITECTOS_LABIM_24L.png'
  ];

  currentIndex = 0;
  currentBg = this.images[0];
  private intervalMs = 6000; 
  private timerId: any;

  ngOnInit(): void {
    // Pre-carga para evitar parpadeo
    this.images.forEach(src => { const img = new Image(); img.src = src; });

    this.timerId = setInterval(() => this.nextBackground(), this.intervalMs);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  private nextBackground() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.currentBg = this.images[this.currentIndex];
  }
}
