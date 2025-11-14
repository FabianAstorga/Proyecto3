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
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FooterComponent,
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private dataService: DataService
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

    // Asegurar formulario limpio al inicio
    this.form.reset();
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
    if (!this.images || this.images.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.currentBg = this.images[this.currentIndex];
  }

  goToSlide(i: number) {
    this.currentIndex = i;
    this.currentBg = this.images[i];
  }

  // --- Lógica de Modal ---

  openLogin(): void {
    this.loginOpen = true;
    this.form.reset();
  }

  closeLogin(): void {
    this.loginOpen = false;
    this.form.reset();
  }

  toggleLogin(): void {
    this.loginOpen = !this.loginOpen;
    if (this.loginOpen) {
      this.form.reset();
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

    // 🔹 Ahora usamos DataService.login (lee users.json internamente)
    this.dataService.login(email, password).subscribe((user) => {
      if (!user) {
        alert('Correo o contraseña incorrectos');
        this.form.reset();
        this.form.markAsUntouched();
        return;
      }

      // 🔹 Generar token simulado (en producción viene del backend)
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora
      };
      const token = btoa(JSON.stringify(payload)); // solo demo
      this.authService.login(token);

      this.closeLogin();

      // 🔹 Redirigir según rol (usando los roles nuevos)
      switch (user.role.toLowerCase()) {
        case 'administrador':
          // Por ahora lo dejamos en home; más adelante irá a un panel admin
          this.router.navigate(['/home']);
          break;
        case 'secretaria':
          this.router.navigate(['/secretaria/perfil', user.id]);
          break;
        case 'funcionario':
          this.router.navigate(['/funcionario/perfil', user.id]);
          break;
        default:
          // Si por algún motivo viene un rol inesperado
          this.router.navigate(['/home']);
          break;
      }
    });
  }
}
