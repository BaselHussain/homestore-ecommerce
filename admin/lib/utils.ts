import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves a product image URL.
 * Absolute URLs are returned as-is.
 * Relative paths are returned as-is (admin serves images from its own public/images/).
 */
export function resolveImageUrl(url: string): string {
  if (!url) return '';
  return url;
}
