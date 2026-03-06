'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '@/lib/framerVariants';
import { FileDown, X, Eye } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface InvoiceOrder {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  shipping_address: Record<string, string>;
}

interface Props {
  onGenerated?: () => void;
}

export default function InvoicesGenerator({ onGenerated }: Props) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taxType, setTaxType] = useState<'percent' | 'fixed'>('percent');
  const [taxValue, setTaxValue] = useState('');
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<{ orders: InvoiceOrder[]; subtotal: number; tax: number; total: number } | null>(null);

  const reset = () => {
    setOpen(false);
    setStartDate('');
    setEndDate('');
    setTaxType('percent');
    setTaxValue('');
    setPreview(null);
  };

  const buildPreview = async () => {
    if (!startDate || !endDate) { toast.error('Please select start and end dates'); return; }
    if (new Date(startDate) > new Date(endDate)) { toast.error('Start date must be before end date'); return; }
    setGenerating(true);
    try {
      const data = await adminApi.getInvoices({ startDate, endDate, limit: 1000 });
      const orders: InvoiceOrder[] = data.invoices ?? [];
      const subtotal = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_amount), 0);
      const taxAmount = taxValue
        ? taxType === 'percent' ? subtotal * (parseFloat(taxValue) / 100) : parseFloat(taxValue)
        : 0;
      setPreview({ orders, subtotal, tax: taxAmount, total: subtotal + taxAmount });
    } catch {
      toast.error('Failed to load invoice data');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!preview) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('HOMESTORE', 20, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('E-commerce Store', 20, y + 7);
    doc.text(`Invoice #HS-${Date.now()}`, pageWidth - 20, y, { align: 'right' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, y + 7, { align: 'right' });

    y += 20;
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Period: ${startDate} to ${endDate}`, 20, y);

    y += 14;
    // Summary box
    doc.setFillColor(248, 248, 248);
    doc.rect(20, y, pageWidth - 40, 36, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 25, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Orders: ${preview.orders.filter(o => o.status !== 'cancelled').length}`, 25, y + 17);
    doc.text(`Subtotal: $${preview.subtotal.toFixed(2)}`, 25, y + 26);
    if (preview.tax > 0) doc.text(`Tax: $${preview.tax.toFixed(2)}`, 90, y + 26);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${preview.total.toFixed(2)}`, pageWidth - 25, y + 26, { align: 'right' });

    y += 46;
    // Orders table header
    doc.setFillColor(30, 30, 30);
    doc.setTextColor(255);
    doc.rect(20, y, pageWidth - 40, 9, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Order ID', 23, y + 6);
    doc.text('Date', 70, y + 6);
    doc.text('Status', 110, y + 6);
    doc.text('Total', pageWidth - 25, y + 6, { align: 'right' });

    y += 10;
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    for (const order of preview.orders.slice(0, 30)) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(order.id.slice(0, 14) + '…', 23, y + 5);
      doc.text(new Date(order.created_at).toLocaleDateString(), 70, y + 5);
      doc.text(order.status, 110, y + 5);
      doc.text(`$${Number(order.total_amount).toFixed(2)}`, pageWidth - 25, y + 5, { align: 'right' });
      y += 9;
      doc.setDrawColor(230);
      doc.line(20, y, pageWidth - 20, y);
    }

    y += 10;
    if (preview.orders.length > 30) {
      doc.setTextColor(100);
      doc.text(`… and ${preview.orders.length - 30} more orders`, 20, y);
    }

    doc.save(`homestore-invoice-${startDate}-${endDate}.pdf`);
    toast.success('Invoice downloaded');
    onGenerated?.();
    reset();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <FileDown className="w-4 h-4" /> Generate Invoice
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={reset} />
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md z-10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Generate Invoice</h2>
                <button onClick={reset} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tax (optional)</label>
                  <div className="flex gap-2">
                    <select value={taxType} onChange={e => setTaxType(e.target.value as 'percent' | 'fixed')}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none">
                      <option value="percent">% Percent</option>
                      <option value="fixed">$ Fixed</option>
                    </select>
                    <input type="number" min="0" step="0.01" value={taxValue} onChange={e => setTaxValue(e.target.value)}
                      placeholder={taxType === 'percent' ? 'e.g. 8' : 'e.g. 50'}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                {/* Preview */}
                {preview && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm">
                    <p className="font-semibold text-foreground mb-2">Invoice Preview</p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Orders</span>
                      <span>{preview.orders.filter(o => o.status !== 'cancelled').length}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${preview.subtotal.toFixed(2)}</span>
                    </div>
                    {preview.tax > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax</span>
                        <span>${preview.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border">
                      <span>Total</span>
                      <span>${preview.total.toFixed(2)}</span>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button onClick={buildPreview} disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60">
                    <Eye className="w-4 h-4" /> {generating ? 'Loading…' : 'Preview'}
                  </button>
                  <button onClick={downloadPDF} disabled={!preview || generating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                    <FileDown className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
