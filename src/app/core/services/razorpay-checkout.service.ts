import { Injectable } from '@angular/core';
import { RazorpayPaymentResponse } from '../models/razorpay';

export interface OpenCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  description?: string;
  prefillName?: string;
  prefillEmail?: string;
}

@Injectable({ providedIn: 'root' })
export class RazorpayCheckoutService {
  /** Resolves with the payment response on success, or null if the user closes the checkout modal. */
  open(options: OpenCheckoutOptions): Promise<RazorpayPaymentResponse | null> {
    return new Promise((resolve) => {
      const razorpay = new Razorpay({
        key: options.key,
        amount: Math.round(options.amount * 100),
        currency: options.currency,
        order_id: options.orderId,
        name: 'FIFA Courts',
        description: options.description,
        handler: (response) => resolve(response),
        modal: { ondismiss: () => resolve(null) },
        prefill: { name: options.prefillName, email: options.prefillEmail },
        theme: { color: '#0057c2' },
      });
      razorpay.open();
    });
  }
}
