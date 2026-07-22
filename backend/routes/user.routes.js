import express from "express";
import {
  getMe,
  updateMe,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  handleProfileUploadError,
  profileUpload,
} from "../middleware/profileUpload.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);

router.patch(
  "/me",
  authMiddleware,
  profileUpload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  handleProfileUploadError,
  updateMe
);

export default router;
