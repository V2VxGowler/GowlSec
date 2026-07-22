import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createEvent,
  createLab,
  createQuestion,
  createRoom,
  createTeam,
  createTrophy,
  createWriteup,
  deleteEvent,
  deleteLab,
  deleteLabMessage,
  deleteQuestion,
  deleteRoom,
  deleteTeam,
  deleteTeamAnnouncement,
  deleteTrophy,
  deleteWriteup,
  getCommunity,
} from "../controllers/community.controller.js";

const router = express.Router();

router.get("/", getCommunity);

router.post("/questions", authMiddleware, createQuestion);
router.delete("/questions/:id", authMiddleware, deleteQuestion);

router.post("/rooms", authMiddleware, createRoom);
router.delete("/rooms/:id", authMiddleware, deleteRoom);

router.post("/teams", authMiddleware, createTeam);
router.delete("/teams/:id", authMiddleware, deleteTeam);
router.delete(
  "/team-announcements/:id",
  authMiddleware,
  deleteTeamAnnouncement
);

router.post("/labs", authMiddleware, createLab);
router.delete("/labs/:id", authMiddleware, deleteLab);
router.delete("/lab-messages/:id", authMiddleware, deleteLabMessage);

router.post("/writeups", authMiddleware, createWriteup);
router.delete("/writeups/:id", authMiddleware, deleteWriteup);

router.post("/trophies", authMiddleware, createTrophy);
router.delete("/trophies/:id", authMiddleware, deleteTrophy);

router.post("/events", authMiddleware, createEvent);
router.delete("/events/:id", authMiddleware, deleteEvent);

export default router;
