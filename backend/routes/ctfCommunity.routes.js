import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
  createCtfResult,
  deleteCtfResult,
  getCtfCommunity,
  leaveCtf,
  participateInCtf,
} from "../controllers/ctfCommunity.controller.js";

const router = express.Router();

router.get("/", getCtfCommunity);
router.post("/:eventId/participations", authMiddleware, participateInCtf);
router.delete("/:eventId/participations", authMiddleware, leaveCtf);
router.post(
  "/:eventId/results",
  authMiddleware,
  adminMiddleware,
  createCtfResult,
);
router.delete("/results/:id", authMiddleware, adminMiddleware, deleteCtfResult);

export default router;
