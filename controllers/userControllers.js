import { User } from "../models/userModel.js";
import TryCatch from "../utils/errorHandler.js";
import generateToken from "../utils/jwtGenerator.js";
import bcrypt from "bcryptjs";
import getDataUrl from "../utils/urlGenerator.js";

import { v2 as cloudinary } from "cloudinary";

export const registerUser = TryCatch(async (req, res) => {
  const { fullname, username, email, phone, password } = req.body;

  if (!fullname || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all required details",
    });
  }

  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      message: "Please provide either an email or a phone number",
    });
  }

  try {
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
      });
    }

    if (email) {
      existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered",
        });
      }
    }

    if (phone) {
      existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Phone number is already registered",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      username,
      email: email || undefined,
      phone: phone || undefined,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = generateToken(savedUser._id);

    res.status(201).json({
      success: true,
      user: {
        _id: savedUser._id,
        fullname: savedUser.fullname,
        username: savedUser.username,
        email: savedUser.email,
        phone: savedUser.phone,
      },
      token,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is already in use`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
});

export const loginUser = TryCatch(async (req, res) => {
  const { username, email, phone, password } = req.body;

  if ((!username && !email && !phone) || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all required details",
    });
  }

  // Construct the query based on the provided credentials
  const query = {};
  if (username) query.username = username;
  if (email) query.email = email;
  if (phone) query.phone = phone;

  let user = await User.findOne(query);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return res.status(400).json({
      success: false,
      message: "Wrong credentials",
    });
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user,
    token,
  });
});

export const getUserProfile = TryCatch(async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id);
  console.log(user);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

export const editUserProfile = TryCatch(async (req, res) => {
  let file = req.file;
  console.log(file);

  let user = await User.findById(req.id);

  const newUserData = {
    fullname: req.body.fullname,
    username: req.body.username,
    email: req.body.email,
    about: req.body.about,
  };

  if (file) {
    const fileUrl = getDataUrl(file);
    const myCloud = await cloudinary.uploader.upload(fileUrl.content);
    if (myCloud) {
      newUserData.profilePicture = myCloud.url;
    }
  }

  user = await User.findByIdAndUpdate(req.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

export const getSuggestedUsers = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.id } }).select("-password");
  if (!users) {
    return res.status(400).json({
      success: false,
      message: "No suggestions available",
    });
  }

  res.status(200).json({
    success: true,
    users,
  });
});

export const followOrUnfollow = TryCatch(async (req, res) => {
  const followGiverId = req.id;
  const followRecieverId = req.query.r_id;

  if (followGiverId == followRecieverId) {
    return res.status(400).json({
      success: false,
      message: "Users cannot follow themselves",
    });
  }

  const followGiver = await User.findById(followGiverId);
  const followReciever = await User.findById(followRecieverId);

  if (!followGiver || !followReciever) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  if (!followGiver.following.includes(followRecieverId)) {
    followGiver.following.push(followRecieverId);
    followReciever.followers.push(followGiverId);
  } else {
    followGiver.following = followGiver.following.filter(
      (item) => item.toString() !== followRecieverId
    );
    followReciever.followers = followReciever.followers.filter(
      (item) => item.toString() !== followGiverId
    );
  }

  await followGiver.save();
  await followReciever.save();

  res.status(200).json({
    success: true,
    followingOfGiver: followGiver.following,
    followersOfReciever: followReciever.followers,
  });
});