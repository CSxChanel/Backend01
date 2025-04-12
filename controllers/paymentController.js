import { createTripayTransaction, handleTripayCallback } from "../services/tripayService.js";
import response from "../helpers/response.js";
import errorResponse from "../helpers/errorResponse.js";

export const createPayment = async (req, res) => {
  const { user, method, amount } = req.body;

  try {
    const paymentUrl = await createTripayTransaction(user, method, amount);
    response(200, { paymentUrl }, "Transaksi berhasil dibuat", res);
  } catch (err) {
    errorResponse(500, err.message, "Gagal membuat transaksi", res);
  }
};

export const callbackPayment = async (req, res) => {
  await handleTripayCallback(req.body);
  res.send("Callback received");
};
