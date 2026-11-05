export type PaymentGatewayInvoice = {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerEmail?: string | null;
  dueDate: Date;
};

export type PaymentGatewayCharge = {
  provider: string;
  reference: string;
  paymentUrl?: string;
  expiresAt?: Date;
  raw?: unknown;
};

export interface PaymentGatewayAdapter {
  readonly provider: string;
  createCharge(invoice: PaymentGatewayInvoice): Promise<PaymentGatewayCharge>;
  verifyNotification(payload: unknown): Promise<{
    reference: string;
    status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
    paidAmount?: number;
    paidAt?: Date;
    raw?: unknown;
  }>;
}

export class ManualPaymentGatewayAdapter implements PaymentGatewayAdapter {
  readonly provider = "MANUAL";

  async createCharge(invoice: PaymentGatewayInvoice): Promise<PaymentGatewayCharge> {
    return {
      provider: this.provider,
      reference: invoice.invoiceNumber,
      raw: { invoiceId: invoice.invoiceId, mode: "manual-payment-proof" },
    };
  }

  async verifyNotification() {
    return {
      reference: "MANUAL",
      status: "PENDING" as const,
      raw: { mode: "manual-payment-proof" },
    };
  }
}

export function getPaymentGatewayAdapter(): PaymentGatewayAdapter {
  return new ManualPaymentGatewayAdapter();
}
