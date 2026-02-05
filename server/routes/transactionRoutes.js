import express from "express";
import { getAllTransactions } from "../controllers/transactionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllTransactions);

export default router;