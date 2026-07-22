import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  getCommunity,
  createQuestion,
  createRoom,
  createTeam,
  createLab,
  createWriteup,
  createTrophy,
  createEvent,
  deleteQuestion,
  deleteRoom,
  deleteTeam,
  deleteLab,
  deleteWriteup,
  deleteTrophy,
  deleteEvent,
} from "../controllers/community.controller.js";

const router = express.Router();


router.get("/", getCommunity);


router.post(
  "/questions",
  authMiddleware,
  createQuestion
);

router.post(
  "/rooms",
  authMiddleware,
  createRoom
);

router.post(
  "/teams",
  authMiddleware,
  createTeam
);

router.post(
  "/labs",
  authMiddleware,
  createLab
);

router.post(
  "/writeups",
  authMiddleware,
  createWriteup
);

router.post(
  "/trophies",
  authMiddleware,
  createTrophy
);

router.post(
  "/events",
  authMiddleware,
  createEvent
);

/*
 * Suppressions protégées.
 */
router.delete(
  "/questions/:id",
  authMiddleware,
  deleteQuestion
);

router.delete(
  "/rooms/:id",
  authMiddleware,
  deleteRoom
);

router.delete(
  "/teams/:id",
  authMiddleware,
  deleteTeam
);

router.delete(
  "/labs/:id",
  authMiddleware,
  deleteLab
);

router.delete(
  "/writeups/:id",
  authMiddleware,
  deleteWriteup
);

router.delete(
  "/trophies/:id",
  authMiddleware,
  deleteTrophy
);

router.delete(
  "/events/:id",
  authMiddleware,
  deleteEvent
);

export default router;