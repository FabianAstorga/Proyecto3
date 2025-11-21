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
    private route: ActivatedRoute, 
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

    const credentials = {
      correo: this.form.value.email.trim(),
      contrasena: this.form.value.password.trim(),
    };

    
    this.authService.loginUser(credentials).subscribe({
      next: () => {
    
        
        this.closeLogin();

        // Verificar si hay una URL de retorno 
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        
        if (returnUrl && returnUrl.trim().length > 0) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        
        const targetRoute = this.authService.getHomeRouteForRole();
        this.router.navigate([targetRoute]);
      },
      error: (err) => {
        
        console.error('Login error:', err);
        
        if (err.status === 401 || err.status === 404) {
          alert('Correo o contraseña incorrectos.');
        } else {
          alert('Ocurrió un error al intentar iniciar sesión. Intente más tarde.');
        }
        
        // Limpiar solo la contraseña
        this.form.get('password')?.reset();
      }
    });
  }
}
