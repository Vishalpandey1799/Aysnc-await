import express from "express";
import { uploader } from "../config/multer.js";
import {sendingBase64 } from "../controllers/Base64.js";
 

const router = express.Router();

router.post("/narrate-frame" ,  sendingBase64)

export default router;