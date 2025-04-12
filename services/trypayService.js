import axios from "axios";
import db from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY;

export async function createTripayTransaction(user, method, amount) {
  const merchantRef = `INV-${Date.now()}`;

  const payload = {
    method,
    merchant_ref: merchantRef,
    amount,
    customer_name: user.username,
    customer_email: user.email,
    order_items: [
      {
        sku: "SKU001",
        name: "Produk Digital",
        price: amount,
        quantity: 1
      }
    ],
    callback_url: "https://yourdomain.com/api/payment/callback",
    return_url: "https://yourdomain.com/payment-success",
    expired_time: Math.floor(Date.now() / 1000) + 24 * 60 * 60
  };

  const { data } = await axios.post("https://tripay.co.id/api/transaction/create", payload, {
    headers: { Authorization: `Bearer ${TRIPAY_API_KEY}` }
  });

  const d = data.data;

  await db.query(
    `INSERT INTO payments (user_id, reference, merchant_ref, method, amount, status, payment_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user.id, d.reference, d.merchant_ref, d.payment_method, d.amount, d.status, d.payment_url]
  );

  return d.payment_url;
}

export async function handleTripayCallback(data) {
  if (!data.reference || !data.status) return;
  await db.query("UPDATE payments SET status = ? WHERE reference = ?", [data.status, data.reference]);
}
