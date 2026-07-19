import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes";
import vehicleRoutes from "./vehicles/vehicle.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",                                      // local dev
  "https://car-dealership-inventory-system-three.vercel.app",    // production
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https:\/\/car-dealership-inventory-system.*\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

export default app;