import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../shared/layout/layout.component';

@Component({
  standalone: true,
  selector: 'app-gestionar-totem',
  imports: [CommonModule, LayoutComponent],
  templateUrl: './gestionar-totem.component.html',
  styleUrls: ['./gestionar-totem.component.scss']
})
export class GestionarTotemComponent {}
