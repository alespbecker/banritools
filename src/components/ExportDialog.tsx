import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportColumn<T> = {
  key: string;
  label: string;
  /** value used for CSV/PDF cells (string, number) */
  accessor: (row: T) => string | number;
  /** default checked */
  defaultChecked?: boolean;
};

type Props<T> = {
  title?: string;
  filenameBase: string;
  columns: ExportColumn<T>[];
  rows: T[];
  triggerLabel?: string;
};

function toCSV(headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [headers, ...rows].map((r) => r.map(escape).join(";")).join("\n");
}

export function ExportDialog<T>({
  title = "Exportar dados",
  filenameBase,
  columns,
  rows,
  triggerLabel = "Exportar",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((c) => [c.key, c.defaultChecked ?? true]))
  );

  const activeColumns = useMemo(
    () => columns.filter((c) => selected[c.key]),
    [columns, selected]
  );

  const toggle = (key: string) =>
    setSelected((s) => ({ ...s, [key]: !s[key] }));

  const setAll = (val: boolean) =>
    setSelected(Object.fromEntries(columns.map((c) => [c.key, val])));

  const buildRows = () => activeColumns.map((c) => c.label);

  const buildBody = () =>
    rows.map((row) => activeColumns.map((c) => c.accessor(row)));

  const stamp = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleCSV = () => {
    if (activeColumns.length === 0) return;
    const csv = toCSV(buildRows(), buildBody());
    // BOM for Excel UTF-8
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenameBase}-${stamp()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const handlePDF = () => {
    if (activeColumns.length === 0) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text(title, 14, 14);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 20);

    autoTable(doc, {
      head: [buildRows()],
      body: buildBody().map((r) => r.map((v) => String(v))),
      startY: 26,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`${filenameBase}-${stamp()}.pdf`);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Selecione as colunas que devem aparecer na exportação.
          </DialogDescription>
        </DialogHeader>

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

        <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCSV} disabled={noneChecked} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handlePDF} disabled={noneChecked} className="gap-2">
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
