'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { staggerContainer, staggerItem } from '@/lib/framerVariants';
import { Upload, Trash2, Copy, Check, ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedImage {
  filename: string;
  url: string;
}

export default function UploadsPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await adminApi.getUploads();
      setImages(data.images ?? []);
    } catch {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));

    setUploading(true);
    try {
      const data = await adminApi.uploadImages(formData);
      const newImages: UploadedImage[] = data.uploaded.map((u: { filename: string; url: string }) => ({
        filename: u.filename,
        url: u.url,
      }));
      setImages(prev => [...newImages, ...prev]);
      toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} uploaded`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copied!');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const deleteImage = async (filename: string) => {
    setDeleting(true);
    try {
      await adminApi.deleteUpload(filename);
      setImages(prev => prev.filter(i => i.filename !== filename));
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Image Uploads</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Upload product images and copy their URLs into your Google Sheet
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop images here or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP — max 5MB each, up to 20 at once</p>
            </div>
          </div>
        )}
      </div>

      {/* How to use */}
      <div className="bg-muted/40 border border-border rounded-xl p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">How to use with Google Sheets:</p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Upload your product images above</li>
          <li>Copy the URL for each image using the Copy button</li>
          <li>Paste the URL into the <code className="bg-muted px-1 rounded text-xs">images</code> column in your Google Sheet</li>
          <li>For multiple images per product, separate URLs with a comma</li>
          <li>Export the Sheet as CSV and use Bulk Import to create products</li>
        </ol>
      </div>

      {/* Images grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
          <ImageIcon className="w-8 h-8 opacity-40" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{images.length} image{images.length !== 1 ? 's' : ''} uploaded</p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {images.map((img, i) => (
              <motion.div
                key={img.filename}
                custom={i}
                variants={staggerItem}
                className="group relative bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Image */}
                <div className="aspect-square bg-muted">
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = ''; }}
                  />
                </div>

                {/* Filename */}
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate" title={img.filename}>
                    {img.filename}
                  </p>
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyUrl(img.url)}
                    className="w-7 h-7 rounded-lg bg-background/90 border border-border flex items-center justify-center hover:bg-accent transition-colors"
                    title="Copy URL"
                  >
                    {copiedUrl === img.url
                      ? <Check className="w-3.5 h-3.5 text-green-500" />
                      : <Copy className="w-3.5 h-3.5 text-foreground" />}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(img.filename)}
                    className="w-7 h-7 rounded-lg bg-background/90 border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Delete Image</h3>
                <button onClick={() => setDeleteTarget(null)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget}</span>? This cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteImage(deleteTarget)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
