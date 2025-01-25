import { Router } from "express";
import { protectroute } from "../middleware/protectroute.js";
import {
  createPost,
  deletePost,
  commentPost,
  likeUnlike,
  getallPost,
  getLikedPost,
} from "../controllers/post.controller.js";

const router = Router();

router.get("/all", protectroute, getallPost);
router.post("/create", protectroute, createPost);
router.delete("/:id", protectroute, deletePost);
router.post("/comment/:id", protectroute, commentPost);
router.post("/like/:id", protectroute, likeUnlike);
router.get("/likes/:id", protectroute, getLikedPost);

export default router;
