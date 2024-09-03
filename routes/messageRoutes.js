import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { getMessage, sendMessage } from "../controllers/messageControllers.js";

const router = express.Router();

router.post("/message/send/:id", isUserAuthenticated, sendMessage);
router.get("/message/all/:id", isUserAuthenticated, getMessage);

export default router;
