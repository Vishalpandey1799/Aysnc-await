import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
const PORT = process.env.PORT || 5000;
import uploadingRoute from "./src/Routes/base.routes.js"




app.use(express.json({ limit: "10mb" }));

app.use("/api/v1", uploadingRoute)




app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});