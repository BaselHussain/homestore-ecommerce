import { serverGetProducts } from '@/lib/server-api';
import ProductsClientPage from './ProductsClientPage';

export const revalidate = 300; // revalidate every 5 minutes

export default async function ProductsPage() {
  const initialProducts = await serverGetProducts({ limit: 100 });

  return <ProductsClientPage initialProducts={initialProducts} />;
}
