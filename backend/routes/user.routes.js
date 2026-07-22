import express from "express";
import {
  getMe,
  getPublicProfile,
  listPublicProfiles,
  recordDailyActivity,
  updateMe,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  handleProfileUploadError,
  profileUpload,
} from "../middleware/profileUpload.js";

const router = express.Router();

router.get("/", listPublicProfiles);
router.get("/me", authMiddleware, getMe);
router.post("/me/activity", authMiddleware, recordDailyActivity);

router.patch(
  "/me",
  authMiddleware,
  profileUpload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  handleProfileUploadError,
  updateMe,
);

router.get("/:username", getPublicProfile);

export default router;
