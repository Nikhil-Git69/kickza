import dotenv from "dotenv";
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import futsalRoutes from "./routes/futsalRoutes.js";
import courtRoutes from "./routes/courtRoutes.js";
import timeslotRoutes from "./routes/timeslotRoutes.js";
import config from "./utils/config.js";
import connectDB from "./utils/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import bookingRoutes from "./routes/bookingRoutes.js";



dotenv.config();
const app = express();

await connectDB();


app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/futsals", futsalRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/timeslots", timeslotRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = config.port;

app.get("/", (req, res) => {
  res.send("Futhub Backend is running!");
}
);

console.log(config.nodeEnv);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 

