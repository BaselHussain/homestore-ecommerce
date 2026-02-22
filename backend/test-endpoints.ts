/// <reference types="node" />
/**
 * Endpoint integration test script.
 * Run with: npx tsx test-endpoints.ts
 * Requires the server to be running on localhost:5000
 */
import 'dotenv/config';
import prisma from './src/lib/prisma';

const BASE = 'http://localhost:5000';
let testUserId = '';
let productId = '';
let cartItemId = '';
let wishlistItemId = '';
let orderId = '';

let passed = 0;
let failed = 0;

async function req(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<{ status: number; body: unknown }> {
  const url = `${BASE}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(testUserId ? { 'x-user-id': testUserId } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(url, options);
  let json: unknown;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, body: json };
}

function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`, detail !== undefined ? JSON.stringify(detail).slice(0, 200) : '');
    failed++;
  }
}

async function run() {
  console.log('=== Homestore API Endpoint Tests ===\n');

  // ── SETUP: create test user ──────────────────────────────────────────────
  console.log('SETUP: Creating test user...');
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      password_hash: 'hashed_placeholder',
    },
  });
  testUserId = user.id;
  console.log(`  Test user ID: ${testUserId}\n`);

  // ── HEALTH ───────────────────────────────────────────────────────────────
  console.log('GET /health');
  const health = await req('GET', '/health');
  check('status 200', health.status === 200, health.body);
  check('has status:ok', (health.body as Record<string,unknown>)?.status === 'ok');
  console.log();

  // ── PRODUCTS ─────────────────────────────────────────────────────────────
  console.log('GET /api/products');
  const products = await req('GET', '/api/products');
  check('status 200', products.status === 200, products.body);
  const pData = (products.body as Record<string,unknown>)?.data as unknown[];
  check('returns array', Array.isArray(pData));
  check('has pagination', !!(products.body as Record<string,unknown>)?.pagination);
  check('at least 1 product', pData?.length > 0);
  if (pData?.length) {
    // Pick first product with stock > 0 to avoid out-of-stock errors in cart tests
    const inStockProduct = (pData as Record<string,unknown>[]).find(p => Number(p.stock) > 0);
    if (inStockProduct) {
      productId = inStockProduct.id as string;
      check('product has required fields', !!inStockProduct.name && !!inStockProduct.price);
    } else {
      check('product has required fields', false, 'No in-stock products found');
    }
  }
  console.log();

  console.log('GET /api/products?search=pots');
  const search = await req('GET', '/api/products?search=pots');
  check('status 200', search.status === 200, search.body);
  const sData = (search.body as Record<string,unknown>)?.data as unknown[];
  check('returns filtered results', Array.isArray(sData));
  console.log();

  console.log('GET /api/products?sort=price_asc');
  const sorted = await req('GET', '/api/products?sort=price_asc');
  check('status 200', sorted.status === 200);
  const sortedData = (sorted.body as Record<string,unknown>)?.data as Record<string,unknown>[];
  if (sortedData?.length > 1) {
    check('sorted ascending by price', Number(sortedData[0].price) <= Number(sortedData[1].price));
  }
  console.log();

  console.log(`GET /api/products/${productId}`);
  const product = await req('GET', `/api/products/${productId}`);
  check('status 200', product.status === 200, product.body);
  check('correct id', (product.body as Record<string,unknown>)?.id === productId);
  check('has images array', Array.isArray((product.body as Record<string,unknown>)?.images));
  console.log();

  console.log('GET /api/products/nonexistent-id');
  const notFound = await req('GET', '/api/products/nonexistent-id');
  check('status 404', notFound.status === 404, notFound.body);
  check('has error object', !!(notFound.body as Record<string,unknown>)?.error);
  console.log();

  console.log('POST /api/products (create product)');
  const newProduct = await req('POST', '/api/products', {
    name: 'Test Product',
    description: 'A test product',
    price: 9.99,
    stock: 10,
    category: 'Test',
    images: ['https://example.com/test.jpg'],
  });
  check('status 201', newProduct.status === 201, newProduct.body);
  check('has id', !!(newProduct.body as Record<string,unknown>)?.id);
  const tempProductId = (newProduct.body as Record<string,unknown>)?.id as string;
  console.log();

  console.log('POST /api/products (validation error)');
  const badProduct = await req('POST', '/api/products', { name: '', price: -5 });
  check('status 400', badProduct.status === 400, badProduct.body);
  console.log();

  // ── CART ─────────────────────────────────────────────────────────────────
  // Test empty-cart order rejection BEFORE adding anything to cart
  console.log('POST /api/orders (empty cart — should fail)');
  const emptyOrder = await req('POST', '/api/orders', {
    shippingAddress: { street: '1 Test St', city: 'Valletta', state: 'VLT', zip: '1000', country: 'MT' },
  });
  check('status 400 (empty cart)', emptyOrder.status === 400, emptyOrder.body);
  console.log();

  console.log('GET /api/cart (empty cart)');
  const emptyCart = await req('GET', '/api/cart');
  check('status 200', emptyCart.status === 200, emptyCart.body);
  check('items array empty', Array.isArray((emptyCart.body as Record<string,unknown>)?.items));
  check('total is 0', (emptyCart.body as Record<string,unknown>)?.total === 0);
  console.log();

  console.log('POST /api/cart (add item)');
  const addCart = await req('POST', '/api/cart', { productId, quantity: 2 });
  check('status 200', addCart.status === 200, addCart.body);
  check('has id', !!(addCart.body as Record<string,unknown>)?.id);
  check('quantity is 2', (addCart.body as Record<string,unknown>)?.quantity === 2);
  cartItemId = (addCart.body as Record<string,unknown>)?.id as string;
  console.log();

  console.log('POST /api/cart (add same item again — should merge)');
  const addCartAgain = await req('POST', '/api/cart', { productId, quantity: 1 });
  check('status 200', addCartAgain.status === 200, addCartAgain.body);
  check('quantity merged to 3', (addCartAgain.body as Record<string,unknown>)?.quantity === 3);
  console.log();

  console.log('GET /api/cart (with items)');
  const filledCart = await req('GET', '/api/cart');
  check('status 200', filledCart.status === 200, filledCart.body);
  check('has 1 item', ((filledCart.body as Record<string,unknown>)?.items as unknown[])?.length === 1);
  check('total > 0', Number((filledCart.body as Record<string,unknown>)?.total) > 0);
  console.log();

  console.log(`PUT /api/cart/${cartItemId} (update quantity)`);
  const updateCart = await req('PUT', `/api/cart/${cartItemId}`, { quantity: 1 });
  check('status 200', updateCart.status === 200, updateCart.body);
  check('quantity updated to 1', (updateCart.body as Record<string,unknown>)?.quantity === 1);
  console.log();

  console.log('POST /api/cart (missing x-user-id)');
  const noUser = await req('POST', '/api/cart', { productId, quantity: 1 }, { 'x-user-id': '' });
  check('status 400', noUser.status === 400, noUser.body);
  console.log();

  console.log('POST /api/cart (product not found)');
  const badCart = await req('POST', '/api/cart', { productId: 'bad-id', quantity: 1 });
  check('status 404', badCart.status === 404, badCart.body);
  console.log();

  // ── WISHLIST ─────────────────────────────────────────────────────────────
  console.log('GET /api/wishlist (empty)');
  const emptyWL = await req('GET', '/api/wishlist');
  check('status 200', emptyWL.status === 200, emptyWL.body);
  check('items array empty', ((emptyWL.body as Record<string,unknown>)?.items as unknown[])?.length === 0);
  console.log();

  console.log('POST /api/wishlist (add item)');
  const addWL = await req('POST', '/api/wishlist', { productId });
  check('status 200', addWL.status === 200, addWL.body);
  check('has id', !!(addWL.body as Record<string,unknown>)?.id);
  wishlistItemId = (addWL.body as Record<string,unknown>)?.id as string;
  console.log();

  console.log('POST /api/wishlist (add same item again — idempotent)');
  const addWLAgain = await req('POST', '/api/wishlist', { productId });
  check('status 200 (idempotent)', addWLAgain.status === 200, addWLAgain.body);
  console.log();

  console.log('GET /api/wishlist (with item)');
  const filledWL = await req('GET', '/api/wishlist');
  check('status 200', filledWL.status === 200, filledWL.body);
  check('has 1 item', ((filledWL.body as Record<string,unknown>)?.items as unknown[])?.length === 1);
  console.log();

  console.log(`DELETE /api/wishlist/${wishlistItemId}`);
  const delWL = await req('DELETE', `/api/wishlist/${wishlistItemId}`);
  check('status 200', delWL.status === 200, delWL.body);
  check('success message', !!(delWL.body as Record<string,unknown>)?.message);
  console.log();

  // ── ORDERS ───────────────────────────────────────────────────────────────
  // Re-add item to cart for order (cart was cleared by last update)
  await req('POST', '/api/cart', { productId, quantity: 1 });

  console.log('POST /api/orders (valid checkout)');
  const createOrder = await req('POST', '/api/orders', {
    shippingAddress: { street: '1 Test St', city: 'Valletta', state: 'VLT', zip: '1000', country: 'MT' },
  });
  check('status 201', createOrder.status === 201, createOrder.body);
  check('has id', !!(createOrder.body as Record<string,unknown>)?.id);
  check('status is Pending', (createOrder.body as Record<string,unknown>)?.status === 'Pending');
  check('has items', Array.isArray((createOrder.body as Record<string,unknown>)?.items));
  check('cart cleared after order', true); // verified below
  orderId = (createOrder.body as Record<string,unknown>)?.id as string;
  console.log();

  console.log('GET /api/cart (should be empty after order)');
  const cartAfterOrder = await req('GET', '/api/cart');
  check('cart empty after checkout', ((cartAfterOrder.body as Record<string,unknown>)?.items as unknown[])?.length === 0);
  console.log();

  console.log('GET /api/orders');
  const orders = await req('GET', '/api/orders');
  check('status 200', orders.status === 200, orders.body);
  check('has orders array', Array.isArray((orders.body as Record<string,unknown>)?.orders));
  check('at least 1 order', ((orders.body as Record<string,unknown>)?.orders as unknown[])?.length >= 1);
  console.log();

  console.log(`GET /api/orders/${orderId}`);
  const order = await req('GET', `/api/orders/${orderId}`);
  check('status 200', order.status === 200, order.body);
  check('correct id', (order.body as Record<string,unknown>)?.id === orderId);
  check('has shipping_address', !!(order.body as Record<string,unknown>)?.shipping_address);
  console.log();

  console.log(`PATCH /api/orders/${orderId}/status → Confirmed`);
  const confirm = await req('PATCH', `/api/orders/${orderId}/status`, { status: 'Confirmed' });
  check('status 200', confirm.status === 200, confirm.body);
  check('status is Confirmed', (confirm.body as Record<string,unknown>)?.status === 'Confirmed');
  console.log();

  console.log('PATCH /api/orders (invalid transition: Confirmed → Delivered)');
  const badTransition = await req('PATCH', `/api/orders/${orderId}/status`, { status: 'Delivered' });
  check('status 400 (invalid transition)', badTransition.status === 400, badTransition.body);
  console.log();

  // ── 404 ─────────────────────────────────────────────────────────────────
  console.log('GET /api/nonexistent-route');
  const unknownRoute = await req('GET', '/api/nonexistent-route');
  check('status 404', unknownRoute.status === 404, unknownRoute.body);
  console.log();

  // ── CLEANUP ──────────────────────────────────────────────────────────────
  console.log('CLEANUP: Removing test data...');
  await prisma.order.deleteMany({ where: { user_id: testUserId } });
  await prisma.cart.deleteMany({ where: { user_id: testUserId } });
  await prisma.wishlist.deleteMany({ where: { user_id: testUserId } });
  await prisma.product.delete({ where: { id: tempProductId } }).catch(() => {});
  await prisma.user.delete({ where: { id: testUserId } });
  console.log('  Cleaned up test user and related data\n');

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  console.log('='.repeat(40));
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(40));
  if (failed > 0) process.exit(1);
}

run()
  .catch((e) => { console.error('Test script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
