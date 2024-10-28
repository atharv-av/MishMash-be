import mongoose from "mongoose";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
import TryCatch from "../utils/errorHandler.js";
import getDataUrl from "../utils/urlGenerator.js";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

export const createPost = TryCatch(async (req, res) => {
  const description = req.body.description;
  const type = req.query.type;
  const authorId = req.id;

  const files = req.files;

  if (!type) {
    return res.status(400).json({
      success: false,
      message: "Please specify post type",
    });
  }

  if (!files && !description) {
    return res.status(400).json({
      success: false,
      message: "Cannot create empty posts",
    });
  }

  if (type === "clip") {
    if (!files) {
      return res.status(400).json({
        success: false,
        message: "Please upload video(s)",
      });
    }
  }
  if (type === "frame") {
    if (!files) {
      return res.status(400).json({
        success: false,
        message: "Please upload photo(s)",
      });
    }
  }
  if (type === "notion") {
    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Please add some text",
      });
    }
  }

  let fileType;
  if (type === "clip") {
    fileType = "video";
  } else {
    fileType = "auto";
  }

  const media = [];
  const postData = {
    author: authorId,
    type: type,
    description,
    media,
  };

  if (files) {
    for (const file of files) {
      const fileUrl = getDataUrl(file);
      const myCloud = await cloudinary.uploader.upload(fileUrl.content, {
        resource_type: `${fileType}`,
      });
      if (myCloud) {
        postData.media.push(myCloud.url);
      }
    }
  }

  const post = await Post.create(postData);
  const author = await User.findById(authorId);

  author.posts.push(post);
  await author.save();

  res.status(200).json({
    success: true,
    message: "Post created successfully",
    post,
  });
});

export const getAllPosts = TryCatch(async (req, res) => {
  const posts = await Post.find();
  if (!posts) {
    return res.status(400).json({
      success: false,
      message: "No posts found",
    });
  }
  res.status(200).json({
    success: true,
    posts,
  });
});

export const getUserPosts = TryCatch(async (req, res) => {
  const author = req.query.author;

  const posts = await Post.find({ author });

  if (!posts) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    posts: posts,
  });
});

export const getPostById = TryCatch(async (req, res) => {
  const postId = req.query.id;

  const post = await Post.findOne({ postId });

  if (!post) {
    return res.status(400).json({
      success: false,
      message: "Post not found",
    });
  }

  res.status(200).json({
    success: true,
    post: post,
  });
});

export const likeordislike = TryCatch(async (req, res) => {
  const postId = req.query.postId;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(400).json({
      success: false,
      message: "Post not found",
    });
  }

  const likedByUser = req.id;

  if (!post.likes.includes(likedByUser)) {
    post.likes.push(likedByUser);
  } else {
    post.likes = post.likes.filter((item) => item.toString() !== likedByUser);
  }

  await post.save();

  res.status(200).json({
    success: true,
    likes: post.likes,
  });
});

export const addComment = TryCatch(async (req, res) => {
  const { comment } = req.body;
  const authorId = req.id;
  const postId = req.query.postId;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(400).json({
      success: false,
      message: "Failed to add comment",
    });
  }
  const commentId = crypto.randomBytes(32).toString("hex");

  post.comments.push({ commentId, authorId, comment });
  await post.save();

  res.status(200).json({
    success: true,
    message: "Comment added successfully",
    author: authorId,
    comment,
  });
});

export const getCommentsOfPost = TryCatch(async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);

  if (!post) {
    return res.status(400).json({
      success: false,
      message: "Post not found",
    });
  }

  res.status(200).json({
    success: true,
    comments: post.comments,
  });
});

export const deleteComment = TryCatch(async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.query.commentId;

  const post = await Post.findOne({ postId });

  if (!post) {
    return res.status(400).json({
      success: false,
      message: "Post not found",
    });
  }

  post.comments = post.comments.filter((item) => item.commentId !== commentId);
  await post.save();

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});

export const addOrRemoveBookmark = TryCatch(async (req, res) => {
  const postId = req.query.postId;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(400).json({
      success: false,
      message: "Post not found",
    });
  }

  const userId = req.id;
  const user = await User.findById(userId);

  if (!user.bookmarks.includes(postId)) {
    user.bookmarks.push(postId);
  } else {
    user.bookmarks = user.bookmarks.filter((item) => item !== postId);
  }
  await user.save();

  res.status(200).json({
    success: true,
    message: "Operation successfull",
    bookmarks: user.bookmarks,
  });
});
