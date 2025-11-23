import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from "@angular/forms";
import { Router, RouterLink, ActivatedRoute } from "@angular/router";
import { FooterComponent } from "../../components/footer/footer.component";
import { AuthService } from "../../services/auth.service";
import { DataService } from "../../services/data.service";

@Component({
  standalone: true,
  selector: "app-home",
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FooterComponent],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("hotbar", { static: true }) hotbarRef!: ElementRef<HTMLElement>;
  hotbarH = 0;

  images: string[] = [
    "assets/img/mecanica3.jpg",
    "assets/img/mecanica2.jpg",
    "assets/img/mecanica.jpg",
  ];

  currentIndex = 0;
  currentBg = this.images[0];
  intervalMs = 5000;
  private timerId: any;

  loginOpen = false;
  showPassword = false;
  form!: FormGroup;

  // Alertas
  alertMessage: string | null = null;
  alertType: "success" | "error" = "error";

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
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
      remember: [false],
    });

    this.form.reset();
  }

  ngAfterViewInit(): void {
    this.measureHotbar();
  }

  @HostListener("window:resize")
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

  // --- Modal login ---
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
    if (this.loginOpen) this.form.reset();
  }

  @HostListener("document:keydown.escape")
  onEsc() {
    if (this.loginOpen) this.closeLogin();
  }

  get f() {
    return this.form.controls;
  }

  showAlert(
    message: string,
    duration = 3000,
    type: "success" | "error" = "error"
  ) {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = null;
    }, duration);
  }

  submit(): void {
    const email = this.form.value.email?.trim();
    const password = this.form.value.password?.trim();

    // Validaciones independientes
    if (!email && !password) {
      this.showAlert("❌ Debes ingresar correo y contraseña", 3000, "error");
      return;
    }
    if (!email) {
      this.showAlert("❌ Debes ingresar tu correo", 3000, "error");
      return;
    }
    if (!password) {
      this.showAlert("❌ Debes ingresar tu contraseña", 3000, "error");
      return;
    }

    // Llamada login
    this.dataService.login(email, password).subscribe({
      next: (res: any) => {
        const user = res.user ?? res.usuario;
        const token = res.token;

        if (!user || !token) {
          this.showAlert("❌ Correo o contraseña incorrectos", 4000, "error");
          return;
        }

        // Guardar token y usuario
        this.authService.login(token, user);

        // Cerrar modal
        this.closeLogin();

        // Mostrar alerta de éxito en verde
        this.showAlert("✅ Sesión iniciada correctamente", 1500, "success");

        // Delay antes de redirigir
        setTimeout(() => {
          const returnUrl =
            this.route.snapshot.queryParamMap.get("returnUrl") ?? "";
          if (returnUrl.trim()) {
            this.router.navigateByUrl(returnUrl);
            return;
          }
          this.router.navigateByUrl(this.authService.getHomeRouteForRole());
        }, 1500); // 1.5 segundos
      },
      error: (err) => {
        console.error("Error en login", err);
        this.showAlert("❌ Correo o contraseña incorrectos", 4000, "error");
      },
    });
  }
}
