'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/products-mock';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelect?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

export default function SearchAutocomplete({
  value,
  onChange,
  onKeyDown,
  onSelect,
  autoFocus,
  placeholder,
  className,
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await productsApi.getAll({ search: value.trim(), limit: 6 });
        setSuggestions(res.data);
        setOpen(true);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: Product) => {
    setOpen(false);
    setSuggestions([]);
    onChange('');
    router.push(`/products/${product.id}`);
    onSelect?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') setOpen(false);
    onKeyDown?.(e);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={className}
      />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
          {suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
          ) : (
            <ul>
              {suggestions.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-left cursor-pointer"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">
                      €{product.price.toFixed(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
