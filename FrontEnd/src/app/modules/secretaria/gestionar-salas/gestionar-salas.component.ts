import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SECRETARIA_NAV_ITEMS } from '../profile-home/secretaria.nav';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-gestionar-salas',
  standalone: true,
  imports: [CommonModule, LayoutComponent, ReactiveFormsModule],
  templateUrl: './gestionar-salas.component.html',
  styleUrls: ['./gestionar-salas.component.scss'],
})
export class GestionarSalasComponent implements OnInit {
  secretariaNavItems = SECRETARIA_NAV_ITEMS;
  salaForm!: FormGroup;

  selectedMapFile: File | null = null;
  mapPreview: string | ArrayBuffer | null = null;
  isDragging: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.salaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      ubicacion: ['', [Validators.required, Validators.maxLength(255)]],
      capacidadMax: [0, [Validators.required, Validators.min(1)]],
      codigo: ['', [Validators.required, Validators.maxLength(10)]],
      QR: ['', [Validators.required, Validators.maxLength(500)]], // obligatorio
      url_mapa: ['', Validators.required], // obligatorio aunque se use la imagen
    });
  }

  // --- Drag & Drop / selección de archivo ---
  handleFileInput(event: any) {
    const file = event.target.files && event.target.files[0];
    if (file) this.processFile(file);
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    }
  }

  processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen (PNG, JPG, GIF, etc.).');
      return;
    }

    this.selectedMapFile = file;
    this.salaForm.get('url_mapa')?.setValue('true'); // marca como obligatorio completado

    const reader = new FileReader();
    reader.onload = (e) => {
      this.mapPreview = e.target?.result ?? null;
    };
    reader.readAsDataURL(file);

    // sincronizar input oculto
    if (this.fileInput && this.fileInput.nativeElement) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      this.fileInput.nativeElement.files = dataTransfer.files;
    }
  }

  removeSelectedImage() {
    this.selectedMapFile = null;
    this.mapPreview = null;
    this.fileInput.nativeElement.value = '';
    this.salaForm.get('url_mapa')?.setValue(''); // resetea el campo obligatorio
  }

  // --- Envío del formulario como JSON ---
  async onSubmit() {
    if (!this.selectedMapFile) {
      alert('La imagen del mapa es obligatoria.');
      return;
    }

    if (this.salaForm.valid) {
      const formValue = this.salaForm.value;

      const salaData: any = {
        nombre: formValue.nombre,
        ubicacion: formValue.ubicacion,
        capacidadMax: formValue.capacidadMax,
        codigo: formValue.codigo,
        QR: formValue.QR,
        mapaArchivo: await this.fileToBase64(this.selectedMapFile),
      };

      console.log('JSON listo para enviar o guardar:', salaData);
      // Aquí iría la llamada al backend
      // this.salaService.crearSala(salaData).subscribe(...)

      // --- RESET FORM ---
      this.salaForm.reset();
      this.selectedMapFile = null;
      this.mapPreview = null;
      if (this.fileInput && this.fileInput.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
    } else {
      this.salaForm.markAllAsTouched();
      console.log('Formulario no válido. Revisar errores.');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
