import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.FROM_EMAIL ?? 'noreply@homestore.com';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderEmailData {
  id: string;
  total_amount: number | string;
  status: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: OrderItem[];
  coupon_code?: string | null;
  discount_amount?: number | null;
}

function itemsTable(items: OrderItem[]): string {
  const rows = items.map(
    (i) =>
      `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${i.name}</td>` +
      `<td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>` +
      `<td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">€${(i.price * i.quantity).toFixed(2)}</td></tr>`
  );
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead><tr style="background:#f9f9f9">
      <th style="padding:8px 12px;text-align:left">Item</th>
      <th style="padding:8px 12px;text-align:center">Qty</th>
      <th style="padding:8px 12px;text-align:right">Subtotal</th>
    </tr></thead>
    <tbody>${rows.join('')}</tbody>
  </table>`;
}

function addressLine(addr: OrderEmailData['shipping_address']): string {
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}`;
}

export async function sendOrderConfirmation(to: string, order: OrderEmailData): Promise<void> {
  if (!resend) return; // dev mode — skip silently

  const total = Number(order.total_amount);
  const discount = order.discount_amount ? Number(order.discount_amount) : 0;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
      <h2 style="color:#1a1a1a">Order Confirmed! 🎉</h2>
      <p>Thank you for your order. Here's your summary:</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      ${itemsTable(order.items)}
      ${discount > 0 ? `<p style="color:#666">Coupon <strong>${order.coupon_code}</strong>: −€${discount.toFixed(2)}</p>` : ''}
      <p style="font-size:16px"><strong>Total: €${total.toFixed(2)}</strong></p>
      <p><strong>Shipping to:</strong> ${addressLine(order.shipping_address)}</p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
      <p style="color:#999;font-size:12px">Homestore — thank you for shopping with us.</p>
    </div>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Order Confirmed — #${order.id.slice(0, 8)}`,
    html,
  });
}

export async function sendShippingUpdate(to: string, order: OrderEmailData): Promise<void> {
  if (!resend) return;

  const statusLabel = order.status === 'Shipped' ? 'has been shipped' : 'has been delivered';
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
      <h2 style="color:#1a1a1a">Your order ${statusLabel}</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Shipping address:</strong> ${addressLine(order.shipping_address)}</p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
      <p style="color:#999;font-size:12px">Homestore — thank you for your order.</p>
    </div>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your order ${statusLabel} — #${order.id.slice(0, 8)}`,
    html,
  });
}

export async function sendPasswordReset(to: string, resetUrl: string): Promise<void> {
  if (!resend) {
    console.log(`[AUTH] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
      <h2 style="color:#1a1a1a">Reset Your Password</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a></p>
      <p style="color:#999;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
    </div>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your Homestore password',
    html,
  });
}
