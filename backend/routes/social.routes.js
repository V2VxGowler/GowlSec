import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
  answerInvitation,
  createInvitation,
  createPoll,
  createRecommendation,
  createReport,
  createTeamScore,
  createWeeklyChallenge,
  getConversation,
  getWeeklyChallenge,
  listConversations,
  listInvitations,
  listNotifications,
  listPolls,
  listRecommendations,
  listReports,
  listTeamFinder,
  listTeamScores,
  readNotifications,
  resolveReport,
  sendDirectMessage,
  updateCustomRole,
  upsertTeamFinder,
  votePoll,
} from "../controllers/social.controller.js";

const router = express.Router();

router.get("/profiles/:username/recommendations", listRecommendations);
router.post(
  "/profiles/:username/recommendations",
  authMiddleware,
  createRecommendation,
);

router.get("/messages", authMiddleware, listConversations);
router.get("/messages/:username", authMiddleware, getConversation);
router.post("/messages/:username", authMiddleware, sendDirectMessage);

router.get("/invitations", authMiddleware, listInvitations);
router.post("/invitations", authMiddleware, createInvitation);
router.patch("/invitations/:id", authMiddleware, answerInvitation);

router.get("/polls", listPolls);
router.post("/polls", authMiddleware, createPoll);
router.post("/polls/:id/votes", authMiddleware, votePoll);

router.get("/weekly-challenge", getWeeklyChallenge);
router.post(
  "/weekly-challenge",
  authMiddleware,
  adminMiddleware,
  createWeeklyChallenge,
);

router.get("/team-finder", listTeamFinder);
router.put("/team-finder/me", authMiddleware, upsertTeamFinder);

router.post("/reports", authMiddleware, createReport);
router.get("/reports", authMiddleware, adminMiddleware, listReports);
router.patch("/reports/:id", authMiddleware, adminMiddleware, resolveReport);

router.get("/team-scores", listTeamScores);
router.post("/team-scores", authMiddleware, adminMiddleware, createTeamScore);
router.patch(
  "/users/:id/custom-role",
  authMiddleware,
  adminMiddleware,
  updateCustomRole,
);

router.get("/notifications", authMiddleware, listNotifications);
router.patch("/notifications/read", authMiddleware, readNotifications);

export default router;
