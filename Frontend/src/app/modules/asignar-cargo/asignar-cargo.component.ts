import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { LayoutComponent } from "../../components/layout/layout.component";

@Component({
  selector: "app-asignar-cargo",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: "./asignar-cargo.component.html",
  styleUrl: "./asignar-cargo.component.scss",
})
export class AsignarCargoComponent {}
