import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileText, FileSpreadsheet, FileType2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export type ExportColumn<T> = {
  key: string;
  label: string;
  /** value used for CSV/PDF/XLSX cells */
  accessor: (row: T) => string | number;
  /** default checked */
  defaultChecked?: boolean;
  /** column formatting hint — affects alignment, totals, number formats */
  format?: "text" | "integer" | "number" | "currency" | "date";
  /** include this column in the totals/summary row */
  summable?: boolean;
};

type Props<T> = {
  title?: string;
  /** Optional secondary line shown on PDF header (e.g. period, agency name) */
  subtitle?: string;
  filenameBase: string;
  columns: ExportColumn<T>[];
  rows: T[];
  triggerLabel?: string;
};

type Fmt = "pdf" | "xlsx" | "csv";

// Brand primary (#0047AB) used in PDF header band.
const BRAND_RGB: [number, number, number] = [0, 71, 171];
const BRAND_SOFT_RGB: [number, number, number] = [239, 244, 252];
const TEXT_RGB: [number, number, number] = [30, 41, 59];
const MUTED_RGB: [number, number, number] = [100, 116, 139];

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
    case "currency":
      return fmtBRL(isNum ? n : Number(raw) || 0);
    case "integer":
      return fmtInt(isNum ? n : Number(raw) || 0);
    case "number":
      return fmtNum(isNum ? n : Number(raw) || 0);
    default:
      return String(raw);
  }
}

export function ExportDialog<T>({
  title = "Exportar dados",
  subtitle,
  filenameBase,
  columns,
  rows,
  triggerLabel = "Exportar",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Fmt>("pdf");
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((c) => [c.key, c.defaultChecked ?? true]))
  );

  const activeColumns = useMemo(
    () => columns.filter((c) => selected[c.key]),
    [columns, selected]
  );

  const toggle = (key: string) => setSelected((s) => ({ ...s, [key]: !s[key] }));
  const setAll = (val: boolean) =>
    setSelected(Object.fromEntries(columns.map((c) => [c.key, val])));

  const headers = activeColumns.map((c) => c.label);

  // Raw numeric/string values per row (for XLSX precision)
  const rawBody = useMemo(
    () => rows.map((row) => activeColumns.map((c) => c.accessor(row))),
    [rows, activeColumns]
  );

  // Pre-formatted strings (for PDF + CSV display)
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
  // Ensure first totals cell shows label even if first column isn't summable.
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

  const handleXLSX = () => {
    const aoa: (string | number)[][] = [];
    // Title rows
    aoa.push([title]);
    if (subtitle) aoa.push([subtitle]);
    aoa.push([`Gerado em ${new Date().toLocaleString("pt-BR")}`]);
    aoa.push([]);
    aoa.push(headers);
    // Data rows — push raw values so Excel keeps numbers numeric
    rawBody.forEach((r) => aoa.push(r));
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
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Merge title rows across all columns
    const lastCol = Math.max(headers.length - 1, 0);
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
      ...(subtitle ? [{ s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } }] : []),
      { s: { r: subtitle ? 2 : 1, c: 0 }, e: { r: subtitle ? 2 : 1, c: lastCol } },
    ];

    // Column widths
    ws["!cols"] = activeColumns.map((c) => ({ wch: Math.max(12, c.label.length + 4) }));

    // Number formats per cell
    const headerRowIdx = subtitle ? 4 : 3;
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

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, `${filenameBase}-${stamp()}.xlsx`);
  };

  const handlePDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 32;

    // Header band
    doc.setFillColor(...BRAND_RGB);
    doc.rect(0, 0, pageW, 56, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("BanriTools", margin, 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Relatório executivo", margin, 40);

    // Right-aligned generation date
    doc.setFontSize(9);
    doc.text(
      `Gerado em ${new Date().toLocaleString("pt-BR")}`,
      pageW - margin,
      40,
      { align: "right" }
    );

    // Title block
    doc.setTextColor(...TEXT_RGB);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, margin, 84);
    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...MUTED_RGB);
      doc.text(subtitle, margin, 100);
    }
    doc.setFontSize(9);
    doc.setTextColor(...MUTED_RGB);
    doc.text(
      `${rows.length} ${rows.length === 1 ? "registro" : "registros"} • ${activeColumns.length} ${activeColumns.length === 1 ? "coluna" : "colunas"}`,
      margin,
      subtitle ? 114 : 100
    );

    autoTable(doc, {
      head: [headers],
      body: formattedBody,
      foot: hasTotals ? [totals.map((v) => String(v))] : undefined,
      startY: subtitle ? 124 : 110,
      margin: { left: margin, right: margin, bottom: 40 },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: TEXT_RGB,
        lineColor: [226, 232, 240],
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
        // Footer with page number + brand line
        const p = doc.getCurrentPageInfo().pageNumber;
        const total = doc.getNumberOfPages();
        doc.setDrawColor(...BRAND_RGB);
        doc.setLineWidth(0.8);
        doc.line(margin, pageH - 28, pageW - margin, pageH - 28);
        doc.setFontSize(8);
        doc.setTextColor(...MUTED_RGB);
        doc.setFont("helvetica", "normal");
        doc.text("BanriTools — Confidencial", margin, pageH - 16);
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
        <Button variant="outline" size="sm" className="gap-2">
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

        {/* Format picker */}
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Formato
          </Label>
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
                  format === v
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-accent"
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
              <Checkbox
                checked={!!selected[c.key]}
                onCheckedChange={() => toggle(c.key)}
              />
              <span className="text-sm">{c.label}</span>
            </Label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={noneChecked} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
