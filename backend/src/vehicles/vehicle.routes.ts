// src/vehicles/vehicle.routes.ts
// Route endpoints for the vehicles inventory module.

import { Router, text as expressText } from "express";
import {
  addVehicle,
  listVehicles,
  filterVehicles,
  editVehicle,
  removeVehicle,
  buyVehicle,
  restockInventoryVehicle,
  exportVehicles,
  importVehicles,
  clearAllVehicles,
} from "./vehicle.controller";
import { authenticate, authorizeAdmin } from "../middleware/auth.middleware";

const router = Router();

// Apply authenticate middleware to protect all vehicle routes
router.use(authenticate);

// Publicly viewable by any authenticated user
router.get("/", listVehicles);
router.get("/search", filterVehicles);

// Purchase can be done by any authenticated user
router.post("/:id/purchase", buyVehicle);

// Admin-only mutations
router.post("/", authorizeAdmin, addVehicle);
router.delete("/", authorizeAdmin, clearAllVehicles);
router.put("/:id", authorizeAdmin, editVehicle);
router.delete("/:id", authorizeAdmin, removeVehicle);
router.post("/:id/restock", authorizeAdmin, restockInventoryVehicle);

// Bulk Import / Export
router.get("/export", authorizeAdmin, exportVehicles);
router.post("/import", authorizeAdmin, expressText({ type: '*/*' }), importVehicles);

export default router;
