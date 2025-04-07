import { Router } from "express";
import { protectroute } from "../middleware/protectroute.js";
import {
  followUnfollow,
  getprofile,
  suggestedUser,
  updateUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/profile/:username", protectroute, getprofile);
router.post("/follow/:id", protectroute, followUnfollow);
router.get("/suggested", protectroute, suggestedUser);
router.post("/update", protectroute, updateUser);

export default router;
