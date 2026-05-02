import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface RazorpayOrderOptions {
  amount: number;
  currency?: string;
  receipt: string;
}

export async function createRazorpayOrder(options: RazorpayOrderOptions) {
  return razorpay.orders.create({
    amount: options.amount * 100,
    currency: options.currency || "INR",
    receipt: options.receipt,
  });
}
