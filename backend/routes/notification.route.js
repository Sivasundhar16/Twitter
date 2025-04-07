import { Router } from "express";
import { protectroute } from "../middleware/protectroute.js";
import {
  deleteNotification,
  getNotification,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", protectroute, getNotification);
router.delete("/", protectroute, deleteNotification);

export default router;
