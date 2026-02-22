'use client';

import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LightSheenButton from '@/components/ui/light-sheen-button';

interface PaymentFormProps {
  subtotal: number;
  onPay: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
};

const formatCvv = (value: string) => value.replace(/\D/g, '').slice(0, 4);

const PaymentForm = ({ subtotal, onPay, onBack, isLoading }: PaymentFormProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPay();
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Payment Details</h2>

      <div className="bg-muted/50 border border-border rounded-xl p-4 mb-6 flex items-center gap-3">
        <Lock className="w-4 h-4 text-primary shrink-0" />
        <p className="text-xs text-muted-foreground">
          This is a simulated payment form. No real charges will be made.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cardName">Cardholder Name</Label>
          <Input
            id="cardName"
            placeholder="John Doe"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(formatCvv(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2 text-sm mt-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">€{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-bold text-primary text-base">€{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 py-3.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <LightSheenButton
            type="submit"
            variant="primary"
            className="flex-1 py-3.5 rounded-full font-semibold text-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : `Pay €${total.toFixed(2)}`}
          </LightSheenButton>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
