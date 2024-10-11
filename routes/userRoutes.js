import express from "express";
import {
  editUserProfile,
  followOrUnfollow,
  getSuggestedUsers,
  getUserProfile,
  loginUser,
  registerUser,
} from "../controllers/userControllers.js";
import { isUserAuthenticated } from "../middlewares/auth.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user/profile/:id", isUserAuthenticated, getUserProfile);
router.post(
  "/user/editprofile",
  isUserAuthenticated,
  uploadFile.single("file"),
  editUserProfile
);
router.get("/user/suggested", isUserAuthenticated, getSuggestedUsers);
router.get("/user/followorunfollow", isUserAuthenticated, followOrUnfollow);

export default router;
