'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { adminApi } from '@/lib/api';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ParsedRow {
  name: string;
  description?: string;
  price: string;
  originalPrice?: string;
  stock: string;
  category: string;
  badge?: string;
  images?: string;
  itemCode?: string;
  _errors?: string[];
  _rowIndex: number;
}

const REQUIRED_COLUMNS = ['name', 'price', 'stock', 'category'];

function validateRow(row: ParsedRow): string[] {
  const errors: string[] = [];
  if (!row.name?.trim()) errors.push('name is required');
  if (!row.price || isNaN(parseFloat(row.price))) errors.push('price must be a number');
  if (!row.stock || isNaN(parseInt(row.stock))) errors.push('stock must be an integer');
  if (!row.category?.trim()) errors.push('category is required');
  return errors;
}

export default function BulkImportPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number } | null>(null);
  const [importError, setImportError] = useState('');
  const [parseError, setParseError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validRows = rows.filter(r => !r._errors?.length);
  const invalidRows = rows.filter(r => r._errors?.length);

  function handleFile(file: File) {
    setParseError('');
    setImportResult(null);
    setImportError('');
    setImported(false);
    setRows([]);
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const headers = results.meta.fields ?? [];
        const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
        if (missing.length) {
          setParseError(`Missing required columns: ${missing.join(', ')}`);
          return;
        }
        const parsed: ParsedRow[] = results.data.map((r, i) => {
          const row: ParsedRow = {
            name: r.name ?? '',
            description: r.description,
            price: r.price ?? '',
            originalPrice: r.originalPrice,
            stock: r.stock ?? '',
            category: r.category ?? '',
            badge: r.badge,
            images: r.images,
            itemCode: r.itemCode,
            _rowIndex: i + 1,
          };
          row._errors = validateRow(row);
          return row;
        });
        setRows(parsed);
      },
      error(err) {
        setParseError(`Parse error: ${err.message}`);
      },
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    setImporting(true);
    setImportError('');
    setImportResult(null);
    try {
      const result = await adminApi.bulkImportProducts(validRows);
      setImportResult({ created: result.created });
      setImported(true);
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setRows([]);
    setFileName('');
    setImportResult(null);
    setImportError('');
    setImported(false);
    setParseError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bulk Import</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload a CSV file to import multiple products at once.</p>
      </div>

      {/* Upload zone — only shown before file is loaded */}
      {rows.length === 0 && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer hover:border-primary hover:bg-accent/30 transition-colors"
          >
            <FileSpreadsheet className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Drop CSV here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Required columns: name, price, stock, category</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {/* CSV format reference — only shown before file is loaded */}
          <div className="border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">CSV Format</h2>
            <pre className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 overflow-x-auto">
{`name,description,price,originalPrice,stock,category,badge,images,itemCode
Sofa,Nice sofa,299,399,10,Furniture,new,https://res.cloudinary.com/.../sofa.jpg,SKU001
Chair,Modern chair,99,,25,Furniture,,https://res.cloudinary.com/.../chair.jpg,`}
            </pre>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li><span className="font-medium text-foreground">Required:</span> name, price, stock, category</li>
              <li><span className="font-medium text-foreground">Optional:</span> description, originalPrice, badge, images, itemCode</li>
              <li><span className="font-medium text-foreground">Multiple images:</span> pipe-separated (|)</li>
              <li><span className="font-medium text-foreground">badge values:</span> new, sale, out-of-stock</li>
            </ul>
          </div>
        </>
      )}

      {parseError && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {parseError}
        </div>
      )}

      {/* Preview */}
      {rows.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium text-foreground">{fileName}</span>
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {validRows.length} valid
              </span>
              {invalidRows.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  {invalidRows.length} invalid
                </span>
              )}
            </div>
            <button onClick={reset} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors pr-1">
              <X className="w-4 h-4" /> Clear
            </button>
          </div>

          {/* Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">#</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Name</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Price</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Stock</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Category</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Badge</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Images</th>
                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr
                      key={row._rowIndex}
                      className={row._errors?.length ? 'bg-destructive/5' : 'hover:bg-muted/30'}
                    >
                      <td className="px-3 py-2 text-muted-foreground">{row._rowIndex}</td>
                      <td className="px-3 py-2 font-medium text-foreground max-w-[180px] truncate">{row.name}</td>
                      <td className="px-3 py-2">{row.price}</td>
                      <td className="px-3 py-2">{row.stock}</td>
                      <td className="px-3 py-2">{row.category}</td>
                      <td className="px-3 py-2">{row.badge || '—'}</td>
                      <td className="px-3 py-2 max-w-[160px] truncate text-muted-foreground">{row.images || '—'}</td>
                      <td className="px-3 py-2">
                        {row._errors?.length ? (
                          <span className="text-destructive text-xs" title={row._errors.join('; ')}>
                            {row._errors.join('; ')}
                          </span>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import button — hidden after successful import */}
          {validRows.length > 0 && !imported && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {importing ? 'Importing…' : `Import ${validRows.length} Products`}
              </button>
              {invalidRows.length > 0 && (
                <p className="text-xs text-muted-foreground">{invalidRows.length} row(s) with errors will be skipped.</p>
              )}
            </div>
          )}

          {/* Result */}
          {importResult && (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Successfully imported {importResult.created} product(s).
              </div>
              <button onClick={reset} className="text-xs text-green-700 dark:text-green-400 hover:underline font-medium">
                Import another file
              </button>
            </div>
          )}
          {importError && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {importError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
