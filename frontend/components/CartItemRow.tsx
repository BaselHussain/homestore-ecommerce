'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartStoreItem } from '@/lib/cart-store';

interface CartItemRowProps {
  item: CartStoreItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItemRow = ({ item, onUpdateQuantity, onRemove }: CartItemRowProps) => {
  const { product, quantity } = item;

  return (
    <div className="flex gap-4 bg-card border border-border rounded-xl p-4">
      <Link href={`/product/${product.id}`} className="shrink-0">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-secondary">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/product/${product.id}`}
          className="font-semibold text-foreground text-sm hover:text-primary transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-border rounded-full">
            <button
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              className="p-2 hover:text-primary transition-colors relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-semibold">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className="p-2 hover:text-primary transition-colors relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-sm font-bold text-foreground">
            €{(product.price * quantity).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={() => onRemove(product.id)}
        className="text-muted-foreground hover:text-destructive transition-colors self-start p-1"
        aria-label="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItemRow;
