import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileText, FileSpreadsheet, FileType2 } from "lucide-react";
import type jsPDF from "jspdf";
import type * as XLSXType from "xlsx-js-style";
// jsPDF, jspdf-autotable e xlsx-js-style são dinamicamente importados
// dentro dos handlers para reduzir o bundle inicial da rota.

export type ExportColumn<T> = {
  key: string;
  label: string;
  accessor: (row: T) => string | number;
  defaultChecked?: boolean;
  format?: "text" | "integer" | "number" | "currency" | "date";
  summable?: boolean;
};

export type ExportSummaryItem = { label: string; value: string; hint?: string };

export type ExportVariant<T = unknown> = {
  id: string;
  label: string;
  hint?: string;
  columns: ExportColumn<T>[];
  rows: T[];
};

type Props<T> = {
  title?: string;
  subtitle?: string;
  filenameBase: string;
  /** Variantes do relatório (ex.: Detalhado / Resumido). Se omitido, usa columns+rows. */
  variants?: ExportVariant<unknown>[];
  columns?: ExportColumn<T>[];
  rows?: T[];
  triggerLabel?: string;
  /** KPIs do time renderizados como cards no topo do PDF/XLSX */
  summary?: ExportSummaryItem[];
};


type Fmt = "pdf" | "xlsx" | "csv";

// Paleta da marca (alinhada ao logo: azul, teal, violeta)
const BRAND_RGB: [number, number, number] = [15, 35, 80]; // navy escuro p/ contraste com logo colorido
const BRAND_BLUE: [number, number, number] = [0, 148, 255];   // #0094FF
const BRAND_TEAL: [number, number, number] = [28, 216, 202];  // #1CD8CA
const BRAND_VIOLET: [number, number, number] = [147, 111, 250]; // #936FFA
const BRAND_SOFT_RGB: [number, number, number] = [239, 244, 252];
const TEXT_RGB: [number, number, number] = [30, 41, 59];
const MUTED_RGB: [number, number, number] = [100, 116, 139];
const BORDER_RGB: [number, number, number] = [226, 232, 240];

// ===== Poppins font loader (para a marca no PDF) =====
let poppinsPromise: Promise<{ regular: string; semibold: string } | null> | null = null;
function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)) as unknown as number[]
    );
  }
  return btoa(binary);
}
async function loadPoppins() {
  if (!poppinsPromise) {
    poppinsPromise = (async () => {
      // TTF completo do Google Fonts (com cmap unicode válido).
      // Tenta jsdelivr primeiro, com fallback p/ raw.githubusercontent.
      const sources = [
        "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins",
        "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins",
      ];
      for (const base of sources) {
        try {
          const [r, s] = await Promise.all([
            fetch(`${base}/Poppins-Regular.ttf`).then((res) => {
              if (!res.ok) throw new Error(`${res.status}`);
              return res.arrayBuffer();
            }),
            fetch(`${base}/Poppins-Medium.ttf`).then((res) => {
              if (!res.ok) throw new Error(`${res.status}`);
              return res.arrayBuffer();
            }),
          ]);
          return { regular: bufferToBase64(r), semibold: bufferToBase64(s) };
        } catch {
          // tenta próximo source
        }
      }
      return null;
    })();
  }
  return poppinsPromise;
}
function registerPoppins(doc: jsPDF, fonts: { regular: string; semibold: string } | null) {
  if (!fonts) return false;
  // jsPDF pode emitir erros via PubSub (ex.: "No unicode cmap for font") sem fazer throw.
  // Validamos chamando getTextWidth — se a fonte não foi registrada de verdade, lança "widths".
  try {
    doc.addFileToVFS("Poppins-Regular.ttf", fonts.regular);
    doc.addFont("Poppins-Regular.ttf", "Poppins", "normal");
    doc.addFileToVFS("Poppins-Medium.ttf", fonts.semibold);
    doc.addFont("Poppins-Medium.ttf", "Poppins", "bold");
    doc.setFont("Poppins", "normal");
    doc.getTextWidth("banritools");
    doc.setFont("Poppins", "bold");
    doc.getTextWidth("banritools");
    return true;
  } catch {
    // Reset p/ helvetica para não deixar font state quebrado
    try {
      doc.setFont("helvetica", "normal");
    } catch {
      /* noop */
    }
    return false;
  }
}

function toCSV(headers: string[], rows: (string | number)[][], totals?: (string | number)[]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const all = [headers, ...rows];
  if (totals) all.push(totals);
  return all.map((r) => r.map(escape).join(";")).join("\n");
}

const fmtBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(n);
const fmtInt = (n: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(n);
const fmtNum = (n: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function formatCell<T>(col: ExportColumn<T>, raw: string | number): string {
  if (raw === "" || raw === null || raw === undefined) return "";
  const n = typeof raw === "number" ? raw : Number(raw);
  const isNum = !Number.isNaN(n) && typeof raw !== "string";
  switch (col.format) {
    case "currency": return fmtBRL(isNum ? n : Number(raw) || 0);
    case "integer":  return fmtInt(isNum ? n : Number(raw) || 0);
    case "number":   return fmtNum(isNum ? n : Number(raw) || 0);
    default: return String(raw);
  }
}

/** Desenha um hexágono preenchido via doc.lines (jsPDF). */
function drawHex(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  color: [number, number, number]
) {
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2; // ponta para cima
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const rel: [number, number][] = [];
  for (let i = 1; i < pts.length; i++) {
    rel.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
  }
  doc.setFillColor(color[0], color[1], color[2]);
  doc.lines(rel, pts[0][0], pts[0][1], [1, 1], "F", true);
}

/** Desenha a marca "banritools" — 3 hexágonos + wordmark com letter spacing.
 *  Retorna a largura total aproximada (para alinhamento). */
function drawBrand(doc: jsPDF, x: number, yCenter: number, scale = 1, hasPoppins = false): number {
  const r = 7 * scale;
  const dx = 6.2 * scale;
  const dy = 9.5 * scale;
  // bloco do logo tem altura ~ dy + r*2; centralizar verticalmente em yCenter
  const blockH = dy + r * 2;
  const topY = yCenter - blockH / 2 + r; // centro do hex de cima
  drawHex(doc, x + dx, topY, r, BRAND_BLUE);
  drawHex(doc, x, topY + dy, r, BRAND_TEAL);
  drawHex(doc, x + dx * 2, topY + dy, r, BRAND_VIOLET);
  // Wordmark — Poppins medium (proporcional ao sidebar: peso 500, tracking leve)
  if (hasPoppins) {
    doc.setFont("Poppins", "bold");
  } else {
    doc.setFont("helvetica", "normal");
  }
  doc.setFontSize(15 * scale);
  doc.setTextColor(255, 255, 255);
  const textX = x + dx * 2 + r + 4 * scale; // mais perto do logo
  doc.text("banritools", textX, yCenter, { charSpace: 0.3, baseline: "middle" });
  const textW = doc.getTextWidth("banritools");
  return textX + textW - x;
}

export function ExportDialog<T>({
  title = "Exportar dados",
  subtitle,
  filenameBase,
  columns: columnsProp,
  rows: rowsProp,
  variants,
  triggerLabel = "Exportar",
  summary,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Fmt>("pdf");

  const variantList = useMemo<ExportVariant<unknown>[]>(() => {
    if (variants && variants.length > 0) return variants;
    return [{ id: "default", label: "Padrão", columns: (columnsProp ?? []) as ExportColumn<unknown>[], rows: (rowsProp ?? []) as unknown[] }];
  }, [variants, columnsProp, rowsProp]);

  const [variantId, setVariantId] = useState<string>(variantList[0].id);
  const currentVariant = useMemo(
    () => variantList.find((v) => v.id === variantId) ?? variantList[0],
    [variantList, variantId]
  );
  const columns = currentVariant.columns as ExportColumn<T>[];
  const rows = currentVariant.rows as T[];

  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((c) => [c.key, c.defaultChecked ?? true]))
  );

  // Reset column selection when variant changes
  useEffect(() => {
    setSelected(Object.fromEntries(columns.map((c) => [c.key, c.defaultChecked ?? true])));
  }, [variantId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeColumns = useMemo(
    () => columns.filter((c) => selected[c.key]),
    [columns, selected]
  );


  const toggle = (key: string) => setSelected((s) => ({ ...s, [key]: !s[key] }));
  const setAll = (val: boolean) =>
    setSelected(Object.fromEntries(columns.map((c) => [c.key, val])));

  const headers = activeColumns.map((c) => c.label);

  const rawBody = useMemo(
    () => rows.map((row) => activeColumns.map((c) => c.accessor(row))),
    [rows, activeColumns]
  );

  const formattedBody = useMemo(
    () => rows.map((row) => activeColumns.map((c) => formatCell(c, c.accessor(row)))),
    [rows, activeColumns]
  );

  const totals = useMemo(() => {
    return activeColumns.map((c, idx) => {
      if (!c.summable) return "";
      const sum = rows.reduce((acc, row) => {
        const v = c.accessor(row);
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) ? acc + n : acc;
      }, 0);
      return idx === 0 ? `Total (${rows.length})` : formatCell(c, sum);
    });
  }, [activeColumns, rows]);

  const hasTotals = activeColumns.some((c) => c.summable);
  if (hasTotals && totals[0] === "") totals[0] = `Total (${rows.length})`;

  const stamp = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  };

  const alignFor = (c: ExportColumn<T>): "left" | "right" =>
    c.format && c.format !== "text" && c.format !== "date" ? "right" : "left";

  const handleCSV = () => {
    const csv = toCSV(headers, formattedBody, hasTotals ? totals : undefined);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenameBase}-${stamp()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleXLSX = async () => {
    const XLSX = await import("xlsx-js-style");
    const lastCol = Math.max(headers.length - 1, 0);
    const aoa: (string | number)[][] = [];
    const merges: XLSXType.Range[] = [];
    const cellStyles: Record<string, { fill?: string; color?: string; bold?: boolean; size?: number; align?: "left" | "right" | "center" }> = {};

    // Header band
    aoa.push(["banritools"]);                                              // row 0
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } });
    cellStyles["A1"] = { bold: true, size: 18, color: "FFFFFF", fill: "0047AB", align: "left" };

    aoa.push([title]);                                                      // row 1
    merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } });
    cellStyles["A2"] = { bold: true, size: 12, color: "1E293B" };

    const metaLine = `${subtitle ? subtitle + "  •  " : ""}Gerado em ${new Date().toLocaleString("pt-BR")}`;
    aoa.push([metaLine]);                                                   // row 2
    merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: lastCol } });
    cellStyles["A3"] = { size: 9, color: "64748B" };

    aoa.push([]);                                                           // row 3 spacer

    // Summary KPI block — pares (Indicador | Valor) em 2 colunas
    if (summary && summary.length > 0) {
      aoa.push(["RESUMO DO TIME"]);
      merges.push({ s: { r: aoa.length - 1, c: 0 }, e: { r: aoa.length - 1, c: lastCol } });
      cellStyles[XLSX.utils.encode_cell({ r: aoa.length - 1, c: 0 })] = {
        bold: true, size: 10, color: "FFFFFF", fill: "0094FF",
      };

      // Distribuir até 4 KPIs por linha
      for (let i = 0; i < summary.length; i += 2) {
        const left = summary[i];
        const right = summary[i + 1];
        const row: (string | number)[] = [left.label, left.value];
        while (row.length < Math.floor(lastCol / 2) * 2) row.push("");
        if (right) {
          // posição: metade direita
          const mid = Math.max(2, Math.floor((lastCol + 1) / 2));
          while (row.length < mid) row.push("");
          row.push(right.label, right.value);
        }
        aoa.push(row);
        const rIdx = aoa.length - 1;
        cellStyles[XLSX.utils.encode_cell({ r: rIdx, c: 0 })] = { bold: true, size: 9, color: "64748B" };
        cellStyles[XLSX.utils.encode_cell({ r: rIdx, c: 1 })] = { bold: true, size: 11, color: "0047AB" };
        if (right) {
          const mid = Math.max(2, Math.floor((lastCol + 1) / 2));
          cellStyles[XLSX.utils.encode_cell({ r: rIdx, c: mid })] = { bold: true, size: 9, color: "64748B" };
          cellStyles[XLSX.utils.encode_cell({ r: rIdx, c: mid + 1 })] = { bold: true, size: 11, color: "0047AB" };
        }
      }
      aoa.push([]); // spacer
    }

    // Table headers
    const headerRowIdx = aoa.length;
    aoa.push(headers);
    headers.forEach((_, c) => {
      cellStyles[XLSX.utils.encode_cell({ r: headerRowIdx, c })] = {
        bold: true, color: "FFFFFF", fill: "0047AB", size: 10,
      };
    });

    // Data rows
    rawBody.forEach((r) => aoa.push(r));

    // Totals
    if (hasTotals) {
      const totalsRaw = activeColumns.map((c, idx) => {
        if (!c.summable) return idx === 0 ? `Total (${rows.length})` : "";
        const sum = rows.reduce((acc, row) => {
          const v = c.accessor(row);
          const n = typeof v === "number" ? v : Number(v);
          return Number.isFinite(n) ? acc + n : acc;
        }, 0);
        return sum;
      });
      if (!activeColumns[0].summable) totalsRaw[0] = `Total (${rows.length})`;
      aoa.push(totalsRaw);
      const totalsRowIdx = aoa.length - 1;
      totalsRaw.forEach((_, c) => {
        cellStyles[XLSX.utils.encode_cell({ r: totalsRowIdx, c })] = {
          bold: true, color: "0047AB", fill: "EFF4FC",
        };
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!merges"] = merges;
    ws["!cols"] = activeColumns.map((c) => ({ wch: Math.max(14, c.label.length + 6) }));

    // Aplicar number formats nas células de dados
    rawBody.forEach((row, r) => {
      row.forEach((val, c) => {
        const col = activeColumns[c];
        if (typeof val !== "number") return;
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIdx + 1 + r, c });
        const cell = ws[cellRef];
        if (!cell) return;
        if (col.format === "currency") cell.z = 'R$ #,##0.00';
        else if (col.format === "integer") cell.z = "#,##0";
        else if (col.format === "number") cell.z = "#,##0.00";
      });
    });

    // Aplicar estilos (xlsx-js-style format)
    for (const ref in cellStyles) {
      const s = cellStyles[ref];
      const cell = ws[ref];
      if (!cell) continue;
      cell.s = {
        font: {
          name: "Calibri",
          sz: s.size ?? 10,
          bold: !!s.bold,
          color: { rgb: s.color ?? "1E293B" },
        },
        fill: s.fill ? { patternType: "solid", fgColor: { rgb: s.fill } } : undefined,
        alignment: { horizontal: s.align ?? "left", vertical: "center" },
      };
    }

    // Altura da primeira linha (header band)
    ws["!rows"] = [{ hpt: 28 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, `${filenameBase}-${stamp()}.xlsx`);
  };

  const handlePDF = async () => {
    const [{ default: JsPDFCtor }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new JsPDFCtor({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 32;

    // Carrega Poppins p/ a marca (best-effort, cai p/ helvetica se falhar)
    const fonts = await loadPoppins();
    const hasPoppins = registerPoppins(doc, fonts);

    // ===== Header band com marca =====
    const bandH = 64;
    doc.setFillColor(...BRAND_RGB);
    doc.rect(0, 0, pageW, bandH, "F");
    const bandCenterY = bandH / 2;
    drawBrand(doc, margin, bandCenterY, 1, hasPoppins);

    // Data à direita — centralizada verticalmente na band
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `Gerado em ${new Date().toLocaleString("pt-BR")}`,
      pageW - margin,
      bandCenterY,
      { align: "right", baseline: "middle" }
    );

    // ===== Título =====
    let cursorY = bandH + 24;
    doc.setTextColor(...TEXT_RGB);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, margin, cursorY);
    cursorY += 14;
    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...MUTED_RGB);
      doc.text(subtitle, margin, cursorY);
      cursorY += 12;
    }
    doc.setFontSize(9);
    doc.setTextColor(...MUTED_RGB);
    doc.text(
      `${rows.length} ${rows.length === 1 ? "registro" : "registros"} • ${activeColumns.length} ${activeColumns.length === 1 ? "coluna" : "colunas"}`,
      margin,
      cursorY
    );
    cursorY += 10;

    // ===== KPI cards (Resumo do Time) =====
    if (summary && summary.length > 0) {
      cursorY += 8;
      const gap = 10;
      const cardsPerRow = Math.min(4, summary.length);
      const cardW = (pageW - margin * 2 - gap * (cardsPerRow - 1)) / cardsPerRow;
      const cardH = 52;
      const accents: Array<[number, number, number]> = [BRAND_BLUE, BRAND_TEAL, BRAND_VIOLET, BRAND_RGB];

      summary.slice(0, cardsPerRow).forEach((kpi, i) => {
        const x = margin + i * (cardW + gap);
        const y = cursorY;
        // sombra leve
        doc.setFillColor(...BRAND_SOFT_RGB);
        doc.roundedRect(x, y, cardW, cardH, 6, 6, "F");
        // borda
        doc.setDrawColor(...BORDER_RGB);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, y, cardW, cardH, 6, 6, "S");
        // barra colorida lateral
        const accent = accents[i % accents.length];
        doc.setFillColor(...accent);
        doc.rect(x, y, 3, cardH, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...MUTED_RGB);
        doc.text(kpi.label.toUpperCase(), x + 12, y + 16, { charSpace: 0.4 });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...TEXT_RGB);
        doc.text(kpi.value, x + 12, y + 38);

        if (kpi.hint) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(...MUTED_RGB);
          doc.text(kpi.hint, x + 12, y + 48);
        }
      });
      cursorY += cardH + 16;
    } else {
      cursorY += 8;
    }

    autoTable(doc, {
      head: [headers],
      body: formattedBody,
      foot: hasTotals ? [totals.map((v) => String(v))] : undefined,
      startY: cursorY,
      margin: { left: margin, right: margin, bottom: 40 },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: TEXT_RGB,
        lineColor: BORDER_RGB,
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: BRAND_RGB,
        textColor: 255,
        fontStyle: "bold",
        halign: "left",
      },
      footStyles: {
        fillColor: BRAND_SOFT_RGB,
        textColor: BRAND_RGB,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: Object.fromEntries(
        activeColumns.map((c, i) => [i, { halign: alignFor(c) }])
      ),
      didDrawPage: () => {
        const p = doc.getCurrentPageInfo().pageNumber;
        const total = doc.getNumberOfPages();
        doc.setDrawColor(...BRAND_RGB);
        doc.setLineWidth(0.8);
        doc.line(margin, pageH - 28, pageW - margin, pageH - 28);
        doc.setFontSize(8);
        doc.setTextColor(...MUTED_RGB);
        doc.setFont(hasPoppins ? "Poppins" : "helvetica", "normal");
        doc.text("banritools — Confidencial", margin, pageH - 16, { charSpace: 0.3 });
        doc.setFont("helvetica", "normal");
        doc.text(`Página ${p} de ${total}`, pageW - margin, pageH - 16, { align: "right" });
      },
    });

    doc.save(`${filenameBase}-${stamp()}.pdf`);
  };

  const handleExport = () => {
    if (activeColumns.length === 0) return;
    if (format === "pdf") handlePDF();
    else if (format === "xlsx") handleXLSX();
    else handleCSV();
    setOpen(false);
  };

  const allChecked = columns.every((c) => selected[c.key]);
  const noneChecked = activeColumns.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 bg-[var(--brand-blue,#0094FF)] text-white shadow-sm hover:bg-[var(--brand-teal,#1CD8CA)] hover:text-white border-transparent"
        >
          <Download className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Escolha o formato e as colunas. {rows.length} {rows.length === 1 ? "registro" : "registros"} no período.
          </DialogDescription>
        </DialogHeader>

        {variantList.length > 1 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tipo de relatório</Label>
            <RadioGroup
              value={variantId}
              onValueChange={setVariantId}
              className={`grid gap-2`}
              style={{ gridTemplateColumns: `repeat(${variantList.length}, minmax(0, 1fr))` }}
            >
              {variantList.map((v) => (
                <Label
                  key={v.id}
                  htmlFor={`var-${v.id}`}
                  className={`flex cursor-pointer flex-col items-start gap-1 rounded-md border p-3 transition-colors ${
                    variantId === v.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value={v.id} id={`var-${v.id}`} className="sr-only" />
                  <span className="text-sm font-medium">{v.label}</span>
                  {v.hint && <span className="text-[10px] text-muted-foreground">{v.hint}</span>}
                </Label>
              ))}
            </RadioGroup>
          </div>
        )}


        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Formato</Label>
          <RadioGroup
            value={format}
            onValueChange={(v) => setFormat(v as Fmt)}
            className="grid grid-cols-3 gap-2"
          >
            {[
              { v: "pdf", icon: FileText, label: "PDF", hint: "Executivo" },
              { v: "xlsx", icon: FileSpreadsheet, label: "Excel", hint: "Analítico" },
              { v: "csv", icon: FileType2, label: "CSV", hint: "Bruto" },
            ].map(({ v, icon: Icon, label, hint }) => (
              <Label
                key={v}
                htmlFor={`fmt-${v}`}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border p-3 text-center transition-colors ${
                  format === v ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-accent"
                }`}
              >
                <RadioGroupItem value={v} id={`fmt-${v}`} className="sr-only" />
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-[10px] text-muted-foreground">{hint}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-xs text-muted-foreground">
            {activeColumns.length} de {columns.length} colunas selecionadas
          </span>
          <button
            type="button"
            onClick={() => setAll(!allChecked)}
            className="text-xs text-primary hover:underline"
          >
            {allChecked ? "Desmarcar todas" : "Marcar todas"}
          </button>
        </div>

        <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {columns.map((c) => (
            <Label
              key={c.key}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2 hover:bg-accent transition-colors"
            >
              <Checkbox checked={!!selected[c.key]} onCheckedChange={() => toggle(c.key)} />
              <span className="text-sm">{c.label}</span>
            </Label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleExport} disabled={noneChecked} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
