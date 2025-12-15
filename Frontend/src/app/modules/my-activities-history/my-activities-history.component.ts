import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LayoutComponent } from "../../components/layout/layout.component";

import { DataService } from "../../services/data.service";
import { AuthService } from "../../services/auth.service";
import { Activity } from "../../models/activity.model";

import jsPDF from "jspdf";

type Estado = Activity["estado"];

interface MonthGroup {
  monthKey: string; // '2025-10'
  monthLabel: string; // 'Octubre 2025'
  activities: Activity[];
}

@Component({
  selector: "app-my-activities-history",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./my-activities-history.component.html",
  styleUrls: ["./my-activities-history.component.scss"],
})
export class MyActivitiesHistoryComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  // ===== Datos persona =====
  funcionarioName = "—";
  cargo = "—";

  // Datos reales desde BD (sí existen)
  correo = "";
  telefono = "";

  // Descripción del cargo (en viñetas)
  descripcionCargoLines: string[] = ["• —"];

  // ===== Logos (dataURL) =====
  private logoDimDataUrl: string | null = null;
  private logoUtaDataUrl: string | null = null;

  // Datos
  private allActivities: Activity[] = [];

  // Agrupación por mes
  groupedMonths: MonthGroup[] = [];
  currentMonthIndex = 0;

  // ===== Getters =====
  get currentMonthGroup(): MonthGroup | null {
    if (!this.groupedMonths.length) return null;
    return this.groupedMonths[this.currentMonthIndex] ?? null;
  }

  get hasPrevMonth(): boolean {
    return this.currentMonthIndex < this.groupedMonths.length - 1;
  }

  get hasNextMonth(): boolean {
    return this.currentMonthIndex > 0;
  }

  // ===== Ciclo de vida =====
  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.groupedMonths = [];
      return;
    }

    // Pre-cargar logos
    this.preloadLogos();

    // 1) Perfil: nombre/apellido, correo, teléfono, rol (fallback de cargo)
    this.dataService.getMyProfile().subscribe({
      next: (me) => {
        if (!me) return;

        this.funcionarioName =
          `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim() || "—";

        this.correo = me.email ?? "";
        this.telefono = me.phone ?? "";

        // Si no hay cargo asignado, al menos usa el rol
        const roleFallback = (me.role ?? "").toString().trim();
        if (roleFallback && (this.cargo === "—" || !this.cargo)) {
          this.cargo = roleFallback;
        }
      },
      error: (err) => console.error("Error cargando perfil:", err),
    });

    // 2) Cargo asignado por usuario (si existe)
    this.dataService.getCargosByUsuario(userId).subscribe({
      next: (cargos) => {
        const c = cargos?.[0];
        if (!c) return;

        const nombreCargo =
          (c as any).nombre ??
          (c as any).name ??
          (c as any).titulo ??
          (c as any).title;

        if (nombreCargo) this.cargo = String(nombreCargo);

        // Descripción del cargo -> viñetas sin numeración
        const funciones: unknown =
          (c as any).funciones ??
          (c as any).functions ??
          (c as any).descripcionCargo ??
          null;

        if (Array.isArray(funciones) && funciones.length) {
          this.descripcionCargoLines = funciones
            .map((x) => String(x).trim())
            .filter(Boolean)
            .map((s) => `• ${this.stripLeadingNumbering(s)}`);
          return;
        }

        const texto =
          (c as any).descripcion ??
          (c as any).detail ??
          (c as any).detalle ??
          (c as any).glosa ??
          "";

        if (texto && String(texto).trim()) {
          const raw = String(texto).trim();
          const parts = raw
            .split(/\r?\n|;|•/g)
            .map((s) => s.trim())
            .filter(Boolean);

          this.descripcionCargoLines =
            parts.length > 0
              ? parts.map((p) => `• ${this.stripLeadingNumbering(p)}`)
              : ["• —"];
        }
      },
      error: (err) => console.warn("No se pudo obtener cargo por usuario:", err),
    });

    // 3) Actividades del funcionario
    this.dataService.getActivitiesByUser(userId).subscribe({
      next: (acts) => {
        this.allActivities = acts ?? [];
        this.rebuildView();
      },
      error: (err) =>
        console.error("Error cargando actividades del funcionario:", err),
    });
  }

  // ===== Helpers texto =====
  private stripLeadingNumbering(s: string): string {
    return s.replace(/^\s*(\d+[\.\)]\s+|-\s+|•\s+)/, "").trim();
  }

  // ===== Navegación entre meses =====
  goPrevMonth(): void {
    if (this.hasPrevMonth) this.currentMonthIndex++;
  }

  goNextMonth(): void {
    if (this.hasNextMonth) this.currentMonthIndex--;
  }

  // ===== Construcción de la vista =====
  private rebuildView(): void {
    if (!this.allActivities.length) {
      this.groupedMonths = [];
      this.currentMonthIndex = 0;
      return;
    }

    const byMonth = new Map<string, Activity[]>();

    for (const a of this.allActivities) {
      const key = a.fecha.slice(0, 7); // 'YYYY-MM'
      const bucket = byMonth.get(key) ?? [];
      bucket.push(a);
      byMonth.set(key, bucket);
    }

    const months: MonthGroup[] = [];

    for (const [monthKey, acts] of byMonth.entries()) {
      acts.sort((a, b) => {
        if (a.fecha < b.fecha) return 1;
        if (a.fecha > b.fecha) return -1;
        return a.titulo.localeCompare(b.titulo);
      });

      months.push({
        monthKey,
        monthLabel: this.getMonthLabel(monthKey),
        activities: acts,
      });
    }

    months.sort((a, b) =>
      a.monthKey < b.monthKey ? 1 : a.monthKey > b.monthKey ? -1 : 0
    );

    this.groupedMonths = months;
    this.currentMonthIndex = 0;
  }

  // ===== Utilidades =====
  formatDMY(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  }

  private getMonthLabel(key: string): string {
    const [yearStr, monthStr] = key.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    const nombre = meses[month - 1] ?? "";
    return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${year}`;
  }

  private monthKeyToUpperLabel(month: MonthGroup): string {
    const [y, m] = month.monthKey.split("-").map(Number);
    const mesesUpper = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];
    return `MES DE ${mesesUpper[(m ?? 1) - 1] ?? "—"} ${y}`;
  }

  // ===== Carga de imágenes (logos) =====
  private async preloadLogos(): Promise<void> {
    const dimPath = "/logodim.png";
    const utaPath = "/logouta.png";

    try {
      this.logoDimDataUrl = await this.loadImageAsDataURL(dimPath);
    } catch (e) {
      console.warn("No se pudo cargar logodim:", e);
      this.logoDimDataUrl = null;
    }

    try {
      this.logoUtaDataUrl = await this.loadImageAsDataURL(utaPath);
    } catch (e) {
      console.warn("No se pudo cargar logouta:", e);
      this.logoUtaDataUrl = null;
    }
  }

  private loadImageAsDataURL(url: string): Promise<string> {
    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} cargando ${url}`);
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("FileReader error"));
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(blob);
          })
      );
  }

  // ===== PDF =====
  async downloadMonthPdf(month: MonthGroup): Promise<void> {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 14;

    // Footer
    const footerLine1 = "Dirección Av. 18 de Septiembre N° 2222, Arica - Chile";
    const footerLine2 = "dim@gestion.uta.cl - +56 58-2205282";
    const footerLine3 = "www.uta.cl";

    const drawFooter = (pageNum: number, total: number) => {
      const y = pageHeight - 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);

      doc.text(footerLine1, marginX, y);
      doc.text(footerLine2, marginX, y + 4);
      doc.text(footerLine3, marginX, y + 8);

      doc.setTextColor(120, 120, 120);
      doc.text(`${pageNum}/${total}`, pageWidth - marginX, y + 8, {
        align: "right",
      });
    };

    const applyFooters = () => {
      const total = doc.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        drawFooter(p, total);
      }
    };

    const dmy = (iso: string) => this.formatDMY(iso);

    // ===== Encabezado =====
    let y = 20;

    // Logos pequeños
    const logoW = 26;
    const logoH = 12;
    const topY = 12;

    const leftX = marginX;
    const rightX = pageWidth - marginX - logoW;

    if (this.logoDimDataUrl) {
      doc.addImage(this.logoDimDataUrl, "PNG", leftX, topY, logoW, logoH);
    } else {
      doc.setDrawColor(200, 200, 200);
      doc.rect(leftX, topY, logoW, logoH);
    }

    if (this.logoUtaDataUrl) {
      doc.addImage(this.logoUtaDataUrl, "PNG", rightX, topY, logoW, logoH);
    } else {
      doc.setDrawColor(200, 200, 200);
      doc.rect(rightX, topY, logoW, logoH);
    }

    y = 40;

    // ===== Marco principal (inicio, excluye firmas) =====
    const frameX = marginX - 4;
    const frameY = 36;
    const frameW = pageWidth - (marginX - 4) * 2;
    const frameStartY = frameY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("DEPARTAMENTO DE INGENIERÍA MECÁNICA", pageWidth / 2, y, {
      align: "center",
    });
    y += 8;

    doc.setFontSize(14);
    doc.text("INFORME DE ACTIVIDADES RELEVANTES", pageWidth / 2, y, {
      align: "center",
    });
    y += 8;

    doc.setFontSize(12);
    doc.text(this.monthKeyToUpperLabel(month), pageWidth / 2, y, {
      align: "center",
    });
    y += 12;

    // ===== Caja identificación =====
    const boxX = marginX;
    const boxW = pageWidth - marginX * 2;
    const boxH = 28;

    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(boxX, y, boxW, boxH, 2, 2, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("NOMBRE", boxX + 4, y + 7);
    doc.text("CORREO", boxX + 4, y + 16);
    doc.text("CARGO", boxX + 4, y + 25);

    doc.setFont("helvetica", "normal");
    doc.text(this.funcionarioName || "—", boxX + 28, y + 7);
    doc.text(this.correo || "—", boxX + 28, y + 16);
    doc.text(this.cargo || "—", boxX + 28, y + 25);

    y += boxH + 10;

    // ===== Descripción del cargo =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Descripción de cargo:", marginX, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const descLines = (this.descripcionCargoLines ?? [])
      .map((s) => String(s).trim())
      .filter(Boolean);

    if (descLines.length) {
      for (const line of descLines) {
        const wrapped = doc.splitTextToSize(line, pageWidth - marginX * 2);
        doc.text(wrapped, marginX, y);
        y += wrapped.length * 5;
      }
    } else {
      doc.text("• —", marginX, y);
      y += 6;
    }

    y += 6;

    // ===== Tabla mensual =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Actividades del mes", marginX, y);
    y += 6;

    const tableX = marginX;
    const tableW = pageWidth - marginX * 2;

    const colFecha = 28;
    const colEstado = 32;
    const colActividad = tableW - colFecha - colEstado;

    const headerH = 8;
    const lineH = 5.5;
    const bottomSafe = 45; // aire para firmas + footer

    const drawTableHeader = () => {
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(200, 200, 200);
      doc.rect(tableX, y, tableW, headerH, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      doc.text("Fecha", tableX + 3, y + 5.5);
      doc.text("Actividad", tableX + colFecha + 3, y + 5.5);
      doc.text("Estado", tableX + colFecha + colActividad + 3, y + 5.5);

      doc.setDrawColor(220, 220, 220);
      doc.line(tableX + colFecha, y, tableX + colFecha, y + headerH);
      doc.line(
        tableX + colFecha + colActividad,
        y,
        tableX + colFecha + colActividad,
        y + headerH
      );

      y += headerH;
    };

    const startNewPageForTable = () => {
      doc.addPage();
      y = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `INFORME DE ACTIVIDADES RELEVANTES — ${this.monthKeyToUpperLabel(month)}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 10;

      drawTableHeader();
    };

    if (y + headerH > pageHeight - bottomSafe) startNewPageForTable();
    else drawTableHeader();

    const activities = month.activities ?? [];

    if (!activities.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("No hay actividades registradas en este mes.", tableX + 3, y + 8);
      y += 16;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      for (const a of activities) {
        const fechaTxt = dmy(a.fecha);
        const actividadTxt = `${a.titulo}${a.detalle ? " - " + a.detalle : ""}`.trim();
        const estadoTxt = a.estado ?? "—";

        const wrappedAct = doc.splitTextToSize(actividadTxt, colActividad - 6);
        const rowH = Math.max(10, wrappedAct.length * lineH + 4);

        if (y + rowH > pageHeight - bottomSafe) {
          startNewPageForTable();
        }

        doc.setDrawColor(230, 230, 230);
        doc.rect(tableX, y, tableW, rowH, "S");

        doc.line(tableX + colFecha, y, tableX + colFecha, y + rowH);
        doc.line(
          tableX + colFecha + colActividad,
          y,
          tableX + colFecha + colActividad,
          y + rowH
        );

        doc.text(fechaTxt, tableX + 3, y + 7);
        doc.text(wrappedAct, tableX + colFecha + 3, y + 7);

        doc.setFont("helvetica", "bold");
        doc.text(estadoTxt, tableX + colFecha + colActividad + 3, y + 7);
        doc.setFont("helvetica", "normal");

        y += rowH;
      }
    }

    // ===== Marco principal (fin, antes de firmas) =====
    const frameEndY = y + 4;
    const frameH = frameEndY - frameStartY;

    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.6);
    doc.roundedRect(frameX, frameStartY, frameW, frameH, 3, 3, "S");

    // ===== Firmas (fuera del marco) =====
    const signaturesBlockH = 34;
    if (y + signaturesBlockH > pageHeight - 24) {
      doc.addPage();
      y = 30;
    } else {
      y += 12;
    }

    const lineW = 70;

    // Izquierda: Funcionario
    const leftSigX = marginX;
    doc.setDrawColor(0, 0, 0);
    doc.line(leftSigX, y + 10, leftSigX + lineW, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(this.funcionarioName || "Funcionario", leftSigX, y + 16);

    doc.setTextColor(90, 90, 90);
    doc.text("Funcionario", leftSigX, y + 21);

    // Derecha: Director
    const rightSigX = pageWidth - marginX - lineW;
    doc.setDrawColor(0, 0, 0);
    doc.line(rightSigX, y + 10, rightSigX + lineW, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Director", rightSigX + lineW, y + 16, { align: "right" });

    doc.setTextColor(90, 90, 90);
    doc.text("Departamento de Ingeniería Mecánica", rightSigX + lineW, y + 21, {
      align: "right",
    });

    // ===== Footer =====
    applyFooters();

    // ===== Guardar =====
    const cleanKey = month.monthKey.replace("-", "");
    doc.save(`informe_actividades_${cleanKey}.pdf`);
  }
}
