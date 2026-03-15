'use client';

import { Heart, Star, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products-mock";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";

const badgeStyles = {
  new: "bg-badge-new text-primary-foreground",
  sale: "bg-badge-sale text-primary-foreground",
  "out-of-stock": "bg-badge-out text-primary-foreground",
};

const badgeLabels = {
  new: "New",
  sale: "Sale",
  "out-of-stock": "Out of Stock",
};

const ProductCard = ({ product, wishlistMode = false }: { product: Product; wishlistMode?: boolean }) => {
  const isOutOfStock = product.badge === "out-of-stock" || product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock !== undefined && product.stock > 0 && product.stock <= 5;
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist: checkWishlist } = useWishlist();
  const isInWishlist = checkWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product);
      toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` });
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast({ title: "Removed from wishlist", description: `${product.name} removed from wishlist.` });
    } else {
      addToWishlist(product);
      toast({ title: "Added to wishlist", description: `${product.name} added to wishlist.` });
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group animate-fade-in block transform transition-all duration-300 hover:-translate-y-3 border border-border rounded-xl overflow-hidden bg-card shadow-lg hover:shadow-2xl hover:shadow-primary/20">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary transition-all duration-300">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${
            isOutOfStock ? "opacity-60" : "group-hover:brightness-75"
          }`}
        />
        {product.badge && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeStyles[product.badge]}`}
          >
            {badgeLabels[product.badge]}
          </span>
        )}
        {/* Wishlist / Remove button */}
        {wishlistMode ? (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWishlist(product.id); }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-card/80 text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 cursor-pointer hover:bg-destructive hover:text-destructive-foreground pointer-events-none md:pointer-events-auto"
            aria-label="Remove from wishlist"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 p-1.5 rounded-full transition-all duration-300 z-10 cursor-pointer ${
              isInWishlist
                ? "bg-primary text-primary-foreground opacity-100"
                : "bg-card/80 text-foreground opacity-0 group-hover:opacity-100 pointer-events-none md:pointer-events-auto"
            }`}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-3.5 h-3.5 ${isInWishlist ? "fill-current" : ""}`} />
          </button>
        )}
        {!isOutOfStock ? (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-5 py-2 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.02] z-10 overflow-hidden whitespace-nowrap pointer-events-none md:pointer-events-auto cursor-pointer before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
          >
            Add to cart
          </button>
        ) : (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm text-muted-foreground text-[10px] font-semibold uppercase px-3 py-1.5 rounded-full z-10 whitespace-nowrap">
            Unavailable
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-body text-sm font-semibold text-foreground leading-tight">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-foreground">€{product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">€{product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        {isLowStock && (
          <p className="text-xs text-amber-600 font-medium mt-0.5">Only {product.stock} left</p>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>
          {/* Mobile-only cart button — always visible since hover is unavailable */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="md:hidden p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
