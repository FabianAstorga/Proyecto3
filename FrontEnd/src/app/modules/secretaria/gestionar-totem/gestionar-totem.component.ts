import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../../shared/layout/layout.component';
import { SECRETARIA_NAV_ITEMS } from '../profile-home/secretaria.nav';

@Component({
  standalone: true,
  selector: 'app-gestionar-totem',
  imports: [CommonModule, LayoutComponent],
  templateUrl: './gestionar-totem.component.html',
  styleUrls: ['./gestionar-totem.component.scss'],
})
export class GestionarTotemComponent {
  secretariaNavItems = SECRETARIA_NAV_ITEMS;
}
