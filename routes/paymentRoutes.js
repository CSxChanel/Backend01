import express from "express";
import {
    createPayment,
    callbackPayment
} from "../controllers/paymentController.js";

const router = express.Router();
router.post("/create", createPayment);
router.post("/callback", callbackPayment);

export default router;
