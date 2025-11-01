import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FooterComponent,
    HttpClientModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('hotbar', { static: true }) hotbarRef!: ElementRef<HTMLElement>;
  hotbarH = 0;

  images: string[] = ['/mecanica3.jpg', '/mecanica2.jpg', '/mecanica.jpg'];
  currentIndex = 0;
  currentBg = this.images[0];
  intervalMs = 5000;
  private timerId: any;

  loginOpen = false;
  showPassword = false;
  form!: FormGroup;

  private users: User[] = [];
  private usersSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Pre-cargar imágenes
    this.images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    this.timerId = setInterval(() => this.nextBackground(), this.intervalMs);

    // Formulario login
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false],
    });

    // Al cargar la página, resetear el formulario para asegurar que está limpio.
    this.form.reset(); // 👈 Reset al inicio

    // Cargar usuarios desde JSON
    this.usersSubscription = this.http
      .get<User[]>('/assets/data/users.json')
      .subscribe({
        next: (data) => {
          this.users = data;
          console.log('Usuarios cargados desde JSON:', this.users); // ✅
        },
        error: (err) => console.error('Error cargando usuarios:', err),
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
    this.usersSubscription?.unsubscribe();
  }

  private nextBackground(): void {
    if (!this.images || this.images.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.currentBg = this.images[this.currentIndex];
  }

  goToSlide(i: number) {
    this.currentIndex = i;
    this.currentBg = this.images[i];
  }

  // --- Lógica de Modal (Añadir Reset aquí) ---

  openLogin(): void {
    this.loginOpen = true;
    this.form.reset(); // 👈 Reset al abrir
  }
  closeLogin(): void {
    this.loginOpen = false;
    this.form.reset(); // 👈 Reset al cerrar
  }
  toggleLogin(): void {
    this.loginOpen = !this.loginOpen;
    if (this.loginOpen) {
      this.form.reset(); // 👈 Reset si se abre
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.loginOpen) this.closeLogin();
  }

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.email.trim();
    const password = this.form.value.password.trim();

    const user = this.users.find(
      (u) =>
        u.email.trim().toLowerCase() === email.toLowerCase() &&
        (u.password ?? '').trim() === password
    );

    if (user) {
      // 🔹 Generar token simulado (en producción viene del backend)
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // expira en 1 hora
      };
      const token = btoa(JSON.stringify(payload)); // solo demo
      this.authService.login(token); // 🔹 Guardar token en AuthService

      this.closeLogin(); // cerrar modal

      // Redirigir según rol
      switch (user.role.toLowerCase()) {
        case 'director':
          this.router.navigate(['/director/perfil', user.id]);
          break;
        case 'secretaria':
          this.router.navigate(['/secretaria/perfil', user.id]);
          break;
        case 'funcionario':
          this.router.navigate(['/funcionario/perfil', user.id]);
          break;
      }
    } else {
      alert('Correo o contraseña incorrectos');
      this.form.reset();
      this.form.markAsUntouched();
    }
  }
}
