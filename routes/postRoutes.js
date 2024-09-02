import express from "express";
import {
  addComment,
  addOrRemoveBookmark,
  createPost,
  deleteComment,
  getAllPosts,
  getCommentsOfPost,
  getUserPosts,
  likeordislike,
} from "../controllers/postControllers.js";
import { isUserAuthenticated } from "../middlewares/auth.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post(
  "/post/create",
  isUserAuthenticated,
  uploadFile.array("file"),
  createPost
);
router.get("/post/all", isUserAuthenticated, getAllPosts);
router.get("/post/userposts", isUserAuthenticated, getUserPosts);
router.get("/post/likeordislike", isUserAuthenticated, likeordislike);
router.post("/post/addcomment", isUserAuthenticated, addComment);
router.get("/post/:id/comments", isUserAuthenticated, getCommentsOfPost);
router.get("/post/:id/deletecomment", isUserAuthenticated, deleteComment);
router.get(
  "/post/addorremovebookmark",
  isUserAuthenticated,
  addOrRemoveBookmark
);

export default router;
