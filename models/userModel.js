import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    bookmarks: [
      {
        type: Object,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("validate", function (next) {
  if (
    (this.email === undefined || this.email === null) &&
    (this.phone === undefined || this.phone === null)
  ) {
    this.invalidate("email", "Either email or phone must be provided");
    this.invalidate("phone", "Either email or phone must be provided");
  }
  next();
});

export const User = mongoose.model("User", userSchema);
