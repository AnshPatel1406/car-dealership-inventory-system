import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes";
import vehicleRoutes from "./vehicles/vehicle.routes";

const app = express();

app.use(cors());
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