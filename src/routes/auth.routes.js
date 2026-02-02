import { signIn, signUp } from "#controller/authController.js";
import express from "express";
const router = express.Router();

router.post("/sign-up",signUp)

router.post("/sign-in",signIn)

router.post("/sign-out", (req, res) => {
  res.send("/api/auth/sign-out response");
});

export default router;
