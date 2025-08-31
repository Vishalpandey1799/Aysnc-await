import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from "cors";
import http from "http";                 
import { WebSocketServer } from "ws";   

import uploadingRoute from "./src/Routes/base.routes.js";
import { handleWsConnection } from './src/config/connection.js'; //  Murf + Gemini handler

const app = express();
const PORT = process.env.PORT || 5000;  

// Express middlewares
app.use(express.json({ limit: "10mb" }));
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use("/api", uploadingRoute);
 
const server = http.createServer(app);

 
export const wss = new WebSocketServer({ server });

 
wss.on("connection", handleWsConnection);

 
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
   
});
