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

export default router;