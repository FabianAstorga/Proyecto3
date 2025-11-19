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
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FooterComponent],
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
    private route: ActivatedRoute, // para leer returnUrl
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

    // Usamos DataService.login (lee users.json internamente)
    this.dataService.login(email, password).subscribe((user) => {
      if (!user) {
        alert('Correo o contraseña incorrectos');
        this.form.reset();
        this.form.markAsUntouched();
        return;
      }

      // Generar token con estructura JWT para que jwtDecode funcione
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora
      };

      // header + payload en base64, sin firma (solo para demo)
      const header = {
        alg: 'none',
        typ: 'JWT',
      };
      const token =
        btoa(JSON.stringify(header)) +
        '.' +
        btoa(JSON.stringify(payload)) +
        '.';

      this.authService.login(token); // guarda en localStorage

      this.closeLogin();

      // Si venimos de un returnUrl (bloqueado por el guard), respetarlo
      const returnUrl =
        this.route.snapshot.queryParamMap.get('returnUrl') ?? '';

      if (returnUrl.trim().length > 0) {
        this.router.navigateByUrl(returnUrl);
        return;
      }

      // Si no hay returnUrl, navegar según rol y nueva estructura de rutas
      switch (user.role.toLowerCase()) {
        case 'administrador':
          this.router.navigate(['/admin', user.id, 'perfil']);
          break;
        case 'secretaria':
          this.router.navigate(['/secretaria', user.id, 'perfil']);
          break;
        case 'funcionario':
          this.router.navigate(['/funcionario', user.id, 'perfil']);
          break;
        default:
          this.router.navigate(['/']);
          break;
      }
    });
  }
}
