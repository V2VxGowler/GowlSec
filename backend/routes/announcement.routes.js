import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from "../controllers/announcement.controller.js";

const router = express.Router();

router.get("/", listAnnouncements);
router.post("/", authMiddleware, adminMiddleware, createAnnouncement);
router.patch("/:id", authMiddleware, adminMiddleware, updateAnnouncement);
router.delete("/:id", authMiddleware, adminMiddleware, deleteAnnouncement);

export default router;
