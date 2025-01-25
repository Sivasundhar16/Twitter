import { Router } from "express";
import { protectroute } from "../middleware/protectroute.js";
import {
  createPost,
  deletePost,
  //   updatePost,
} from "../controllers/post.controller.js";

const router = Router();

router.post("/create", protectroute, createPost);
// router.post("/like/:id", protectroute, createPost);
// router.post("/comment", protectroute, updatePost);
router.delete("/:id", protectroute, deletePost);

export default router;
