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

  // Info del funcionario
  funcionarioName = "";

  // Datos
  private allActivities: Activity[] = [];

  // Agrupación por mes
  groupedMonths: MonthGroup[] = [];
  currentMonthIndex = 0;

  // ===== Getters de navegación / vista =====

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
      // si por algún motivo no hay id, no seguimos
      this.groupedMonths = [];
      return;
    }

    // Nombre del funcionario
    this.dataService.getUser(userId).subscribe({
      next: (user) => {
        if (user) {
          this.funcionarioName = `${user.firstName} ${user.lastName}`;
        }
      },
      error: (err) => console.error("Error cargando usuario:", err),
    });

    // Cargar actividades solo del funcionario
    this.dataService.getActivitiesByUser(userId).subscribe({
      next: (acts) => {
        this.allActivities = acts;
        this.rebuildView();
      },
      error: (err) =>
        console.error("Error cargando actividades del funcionario:", err),
    });
  }

  // ===== Navegación entre meses =====

  goPrevMonth(): void {
    if (this.hasPrevMonth) {
      this.currentMonthIndex++;
    }
  }

  goNextMonth(): void {
    if (this.hasNextMonth) {
      this.currentMonthIndex--;
    }
  }

  // ===== Construcción de la vista =====

  private rebuildView(): void {
    if (!this.allActivities.length) {
      this.groupedMonths = [];
      this.currentMonthIndex = 0;
      return;
    }

    // Agrupar por mes (YYYY-MM)
    const byMonth = new Map<string, Activity[]>();

    for (const a of this.allActivities) {
      const key = a.fecha.slice(0, 7); // 'YYYY-MM'
      const bucket = byMonth.get(key) ?? [];
      bucket.push(a);
      byMonth.set(key, bucket);
    }

    const months: MonthGroup[] = [];

    for (const [monthKey, acts] of byMonth.entries()) {
      // ordenar actividades del mes por fecha desc y luego por título
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

    // Ordenar meses: más reciente primero
    months.sort((a, b) =>
      a.monthKey < b.monthKey ? 1 : a.monthKey > b.monthKey ? -1 : 0
    );

    this.groupedMonths = months;
    this.currentMonthIndex = this.groupedMonths.length ? 0 : 0;
  }

  // ===== Utilidades =====

  formatDMY(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    return `${String(d).padStart(2, "0")}/${String(m).padStart(
      2,
      "0"
    )}/${y}`;
  }

  statusPillClass(est: "" | Estado): string {
    switch (est) {
      case "Aprobada":
        return "pill-status-aprobada";
      case "Pendiente":
        return "pill-status-pendiente";
      case "Rechazada":
        return "pill-status-rechazada";
      default:
        return "pill-status-default";
    }
  }

  private getMonthLabel(key: string): string {
    const [yearStr, monthStr] = key.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr); // 1..12
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

  // ===== PDF por mes (personal, con mismo estilo que el global) =====

  downloadMonthPdf(month: MonthGroup): void {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginX = 14;
    let y = 20;

    // === 0. LOGOS DEPARTAMENTO (PLACEHOLDERS logdim1 / logdim2) ===
    const logoWidth = 30;
    const logoHeight = 15;

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    // Logo izquierdo (logdim1)
    doc.rect(marginX, 10, logoWidth, logoHeight);
    doc.text(
      "logdim1",
      marginX + logoWidth / 2,
      10 + logoHeight / 2 + 2,
      { align: "center" }
    );

    // Logo derecho (logdim2)
    const rightLogoX = pageWidth - marginX - logoWidth;
    doc.rect(rightLogoX, 10, logoWidth, logoHeight);
    doc.text(
      "logdim2",
      rightLogoX + logoWidth / 2,
      10 + logoHeight / 2 + 2,
      { align: "center" }
    );

    // Bajamos un poco más el cursor de escritura para el título
    y = 32;

    // Función para formatear la fecha a 'DD-mes' (ej: 21-nov)
    const formatShort = (iso: string): string => {
      const [_, monthStr, dayStr] = iso.split("-");
      const d = Number(dayStr);
      const m = Number(monthStr); // 1..12
      const meses = [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sept",
        "oct",
        "nov",
        "dic",
      ];
      return `${String(d).padStart(2, "0")}-${meses[m - 1] ?? ""}`;
    };

    // === 1. ENCABEZADO PRINCIPAL (TÍTULO Y FUNCIONARIO) ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Mis actividades", pageWidth / 2, y, {
      align: "center",
    });
    y += 8;

    const funcName =
      this.funcionarioName || "Funcionario (sin identificar)";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    doc.text(
      `${month.monthLabel.toLowerCase()} — ${funcName}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 10;

    const tableMarginX = marginX;
    const tableWidth = pageWidth - tableMarginX * 2;
    const headerHeight = 10;
    const lineHeight = 8; // Altura base de línea de texto

    const dateColWidth = 36;
    const statusColWidth = 42;
    const activityColWidth = tableWidth - dateColWidth - statusColWidth;

    const bottomMargin = 30;

    // === 2. TABLA ÚNICA CON LAS ACTIVIDADES DEL FUNCIONARIO ===
    const activities = month.activities;

    if (!activities.length) {
      // Si no hay actividades, guardamos un PDF simple
      const cleanKeyEmpty = month.monthKey.replace("-", "");
      doc.text(
        "No hay actividades registradas en este mes.",
        pageWidth / 2,
        y + 10,
        { align: "center" }
      );
      doc.save(`mis_actividades_${cleanKeyEmpty}.pdf`);
      return;
    }

    // --- 2.1. Calcular altura de la tabla y bloque de firma ---
    let bodyHeight = 0;
    const rowHeights: number[] = [];

    doc.setFontSize(11);
    activities.forEach((a) => {
      const lineaBase = `${a.titulo} — ${a.detalle || ""}`.trim();
      const wrapped = doc.splitTextToSize(
        lineaBase,
        activityColWidth - 8 // margen interno
      );
      const minRowHeight = 14;
      const rowHeight = Math.max(
        minRowHeight,
        wrapped.length * lineHeight + 4
      );
      rowHeights.push(rowHeight);
      bodyHeight += rowHeight;
    });

    const tableHeight = headerHeight + bodyHeight + 2;
    const gapBetweenTableAndSignature = 10;
    const signatureBlockHeight = 14; // "Firma funcionario" + línea
    const gapAfterSignature = 6;

    const totalBlockHeight =
      tableHeight +
      gapBetweenTableAndSignature +
      signatureBlockHeight +
      gapAfterSignature;

    // Si no cabe todo el bloque en la página, lo movemos a una nueva
    if (y + totalBlockHeight > pageHeight - bottomMargin) {
      doc.addPage();

      // Logos en la nueva página
      const newPageLogoY = 10;
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      doc.rect(marginX, newPageLogoY, logoWidth, logoHeight);
      doc.text(
        "logdim1",
        marginX + logoWidth / 2,
        newPageLogoY + logoHeight / 2 + 2,
        { align: "center" }
      );

      const newRightLogoX = pageWidth - marginX - logoWidth;
      doc.rect(newRightLogoX, newPageLogoY, logoWidth, logoHeight);
      doc.text(
        "logdim2",
        newRightLogoX + logoWidth / 2,
        newPageLogoY + logoHeight / 2 + 2,
        { align: "center" }
      );

      y = 32;

      // Repetimos encabezado reducido
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Mis actividades - ${month.monthLabel}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 8;
    }

    const tableY = y;

    // --- 2.2. CONTENEDOR DE LA TABLA ---
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.6);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(
      tableMarginX,
      tableY,
      tableWidth,
      tableHeight,
      4,
      4,
      "S"
    );

    const innerX = tableMarginX;
    const innerWidth = tableWidth;
    const innerTop = tableY;
    const innerBottom = tableY + tableHeight;

    // --- 2.3. ENCABEZADO DE COLUMNAS ---
    doc.setFillColor(245, 245, 245);
    doc.rect(
      innerX + 1,
      innerTop + 1,
      innerWidth - 2,
      headerHeight,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const headerBaseline = innerTop + headerHeight - 2;
    doc.text("Fecha", innerX + 5, headerBaseline);
    doc.text("Actividad", innerX + dateColWidth + 5, headerBaseline);
    doc.text(
      "Estado",
      innerX + dateColWidth + activityColWidth + 5,
      headerBaseline
    );

    // Líneas divisorias verticales
    doc.setDrawColor(230, 230, 230);
    const v1 = innerX + dateColWidth;
    const v2 = innerX + dateColWidth + activityColWidth;
    doc.line(v1, innerTop, v1, innerBottom);
    doc.line(v2, innerTop, v2, innerBottom);
    doc.line(
      innerX,
      innerTop + headerHeight + 1,
      innerX + innerWidth,
      innerTop + headerHeight + 1
    ); // Separador bajo el header

    let currentY = innerTop + headerHeight + 1;

    // --- 2.4. FILAS DE ACTIVIDADES ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(235, 235, 235);

    activities.forEach((a, idx) => {
      const rowHeight = rowHeights[idx];

      // Posición central vertical de la fila
      const centerBaselineY = currentY + rowHeight / 2 + 1.5;

      // 1. FECHA
      const fechaTxt = formatShort(a.fecha);
      doc.text(fechaTxt, innerX + 5, centerBaselineY);

      // 2. ACTIVIDAD (multilínea)
      const actividadTxt = `${a.titulo} — ${a.detalle || ""}`.trim();
      const wrapped = doc.splitTextToSize(
        actividadTxt,
        activityColWidth - 8
      );

      const textBlockHeight = wrapped.length * lineHeight;
      const activityStartPaddingY = (rowHeight - textBlockHeight) / 2;

      doc.text(
        wrapped,
        innerX + dateColWidth + 5,
        currentY + activityStartPaddingY + lineHeight
      );

      // 3. ESTADO (centrado en columna)
      const estadoLabel = a.estado;
      const pillTextSize = 11;
      doc.setFontSize(pillTextSize);

      const estadoX = innerX + dateColWidth + activityColWidth;
      const textWidth = doc.getTextWidth(estadoLabel);
      const pillTextX = estadoX + (statusColWidth - textWidth) / 2;

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(estadoLabel, pillTextX, centerBaselineY);

      // Volver a configuración por defecto
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      // 4. LÍNEA DIVISORIA HORIZONTAL
      if (idx < activities.length - 1) {
        const rowBottom = currentY + rowHeight;
        doc.setDrawColor(235, 235, 235);
        doc.line(
          innerX + 1,
          rowBottom,
          innerX + innerWidth - 1,
          rowBottom
        );
      }

      currentY += rowHeight;
    });

    // --- 2.5. FIRMA DEL FUNCIONARIO ---
    const signatureY = tableY + tableHeight + gapBetweenTableAndSignature;
    const lineY = signatureY + 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    doc.text("Firma funcionario:", tableMarginX, signatureY);
    doc.setDrawColor(0, 0, 0);
    doc.line(tableMarginX + 40, lineY, tableMarginX + 105, lineY);

    // Actualizamos y para lo que venga después (aunque ya no hay más bloques)
    y = tableY + totalBlockHeight;

    // === 3. FIRMA DIRECTOR AL FINAL DEL DOCUMENTO ===
    const finalPageNumber = doc.getNumberOfPages();
    doc.setPage(finalPageNumber);

    const finalPageWidth = doc.internal.pageSize.getWidth();
    const finalPageHeight = doc.internal.pageSize.getHeight();

    const directorLineWidth = 80;
    const directorLineY = finalPageHeight - 25;
    const directorLineXStart =
      (finalPageWidth - directorLineWidth) / 2;

    // Línea de firma del Director
    doc.setDrawColor(0, 0, 0);
    doc.line(
      directorLineXStart,
      directorLineY,
      directorLineXStart + directorLineWidth,
      directorLineY
    );

    // Texto bajo la línea
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    doc.text(
      "Firma Director",
      finalPageWidth / 2,
      directorLineY + 6,
      { align: "center" }
    );
    doc.text(
      "Departamento Mecánica",
      finalPageWidth / 2,
      directorLineY + 12,
      { align: "center" }
    );

    // === 4. GUARDAR EL ARCHIVO ===
    const cleanKey = month.monthKey.replace("-", "");
    doc.save(`mis_actividades_${cleanKey}.pdf`);
  }
}
