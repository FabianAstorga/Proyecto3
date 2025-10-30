import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
<<<<<<< HEAD
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('hotbar', { static: true }) hotbarRef!: ElementRef<HTMLElement>;
  hotbarH = 0;

=======
export class HomeComponent implements OnInit, OnDestroy {
>>>>>>> e17ab052 (feac: ningun cambio)
  images: string[] = [
    '/mecanica3.jpg',
    '/mecanica2.jpg',
<<<<<<< HEAD
    '/mecanica.jpg'
=======
    '/MARSINO_ARQUITECTOS_LABIM_11L.png',
    '/MARSINO_ARQUITECTOS_LABIM_18L.png',
    '/MARSINO_ARQUITECTOS_LABIM_21L.png',
    '/MARSINO_ARQUITECTOS_LABIM_24L.png',
>>>>>>> e17ab052 (feac: ningun cambio)
  ];
  currentIndex = 0;
  currentBg = this.images[0];
  private intervalMs = 6000;
  private timerId: any;

  loginOpen = false;

  form!: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
<<<<<<< HEAD
    this.images.forEach(src => { const img = new Image(); img.src = src; });
=======
    this.images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

>>>>>>> e17ab052 (feac: ningun cambio)
    this.timerId = setInterval(() => this.nextBackground(), this.intervalMs);

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  ngAfterViewInit(): void {
    this.measureHotbar();
  }

  @HostListener('window:resize')
  onResize() {
    this.measureHotbar();
  }

  private measureHotbar() {
    const el = this.hotbarRef?.nativeElement;
    this.hotbarH = el ? el.offsetHeight : 56;
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  private nextBackground(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.currentBg = this.images[this.currentIndex];
  }

  goToSlide(i: number) {
    this.currentIndex = i;
    this.currentBg = this.images[i];
  }

  openLogin(): void { this.loginOpen = true; }
  closeLogin(): void { this.loginOpen = false; }
  toggleLogin(): void { this.loginOpen = !this.loginOpen; }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.loginOpen) this.closeLogin();
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('Login genérico', this.form.value);
    this.closeLogin();
  }
}
