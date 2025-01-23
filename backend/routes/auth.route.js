import { Router } from "express";
import {
  signup,
  login,
  logout,
  profile,
} from "../controllers/auth.controller.js";
import { protectroute } from "../middleware/protectroute.js";

const router = Router();

router.post("/signup", signup);
router.get("/login", login);
router.post("/logout", logout);
router.get("/me", protectroute, profile);

export default router;
