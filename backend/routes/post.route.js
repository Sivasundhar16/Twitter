import { Router } from "express";
import { protectroute } from "../middleware/protectroute.js";
import {
  createPost,
  deletePost,
  commentPost,
  likeUnlike,
  getallPost,
  getLikedPost,
  getFollowingPost,
  getUserPost,
} from "../controllers/post.controller.js";

const router = Router();

router.get("/all", protectroute, getallPost);
router.get("/following", protectroute, getFollowingPost);
router.post("/create", protectroute, createPost);
router.get("/user/:username", protectroute, getUserPost);
router.delete("/:id", protectroute, deletePost);
router.post("/comment/:id", protectroute, commentPost);
router.post("/like/:id", protectroute, likeUnlike);
router.get("/likes/:id", protectroute, getLikedPost);

export default router;
