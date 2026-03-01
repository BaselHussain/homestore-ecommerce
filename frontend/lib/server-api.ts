import type { Product } from './products-mock';

// Matches the convention in api.ts: env var already includes /api
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api';

// Maps raw backend product to frontend display type (server-safe, no browser APIs)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(raw: any): Product {
  const images: string[] = Array.isArray(raw.images) ? raw.images : [];
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: parseFloat(raw.price),
    originalPrice: raw.originalPrice != null ? parseFloat(raw.originalPrice) : undefined,
    image: images[0] || '/images/category-household.jpg',
    images,
    category: raw.category,
    badge: (raw.badge as Product['badge']) || undefined,
    rating: raw.rating != null ? parseFloat(raw.rating) : 0,
    reviews: raw.reviews ?? 0,
    itemCode: raw.itemCode ?? '',
    stock: raw.stock,
  };
}

export async function serverGetProducts(params?: {
  limit?: number;
  category?: string;
  revalidate?: number;
}): Promise<Product[]> {
  const url = new URL(`${API_BASE}/products`);
  if (params?.limit) url.searchParams.set('limit', String(params.limit));
  if (params?.category) url.searchParams.set('category', params.category);

  // Abort after 3 seconds so server components never hang indefinitely
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: params?.revalidate ?? 300 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map(mapProduct);
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}
