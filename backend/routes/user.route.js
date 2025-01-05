import { Router } from "express";
import { protectroute } from "../middleware/protectroute.js";
import { followUnfollow, getprofile } from "../controllers/user.controller.js";

const router = Router();

router.get("/profile/:username", protectroute, getprofile);
router.post("/follow/:id", protectroute, followUnfollow);

export default router;
