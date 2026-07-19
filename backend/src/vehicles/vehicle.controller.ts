// src/vehicles/vehicle.controller.ts
// Request handlers for the vehicle inventory API endpoints.

import { Request, Response } from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from "./vehicle.service";
import {
  createVehicleSchema,
  updateVehicleSchema,
  searchVehicleSchema,
  restockVehicleSchema,
} from "./vehicle.validator";

/**
 * Adds a new vehicle (Admin only).
 */
export async function addVehicle(req: Request, res: Response) {
  try {
    const parsed = createVehicleSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Attach user ID as creator reference (asserting req.user exists from authenticate middleware)
    const creatorId = req.user?.userId;
    const vehicleData = {
      ...parsed.data,
      createdBy: creatorId ? new Object(creatorId) as any : undefined, // Convert string to object representation or keep it. DB reference handles strings/ObjectIds seamlessly.
    };

    const vehicle = await createVehicle(vehicleData);

    return res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Lists all available vehicles.
 */
export async function listVehicles(req: Request, res: Response) {
  try {
    const vehicles = await getAllVehicles();
    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Searches and filters vehicles.
 */
export async function filterVehicles(req: Request, res: Response) {
  try {
    const parsed = searchVehicleSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const results = await searchVehicles(parsed.data);

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Updates a vehicle by ID (Admin only).
 */
export async function editVehicle(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const parsed = updateVehicleSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const vehicle = await updateVehicle(id, parsed.data);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Deletes a vehicle by ID (Admin only).
 */
export async function removeVehicle(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const isDeleted = await deleteVehicle(id);

    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Purchases a vehicle (decreases quantity by 1).
 */
export async function buyVehicle(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const vehicle = await purchaseVehicle(id);

    return res.status(200).json({
      success: true,
      message: "Vehicle purchased successfully",
      data: vehicle,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Vehicle not found") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (error instanceof Error && error.message === "Vehicle is out of stock") {
      return res.status(400).json({
        success: false,
        message: "Vehicle is out of stock",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Restocks a vehicle (increases quantity, Admin only).
 */
export async function restockInventoryVehicle(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const parsed = restockVehicleSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const vehicle = await restockVehicle(id, parsed.data.quantity);

    return res.status(200).json({
      success: true,
      message: "Vehicle restocked successfully",
      data: vehicle,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Vehicle not found") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Export all vehicles to a CSV file.
 */
export async function exportVehicles(req: Request, res: Response) {
  try {
    const vehicles = await getAllVehicles(); 

    const header = "Make,Model,Category,Price,Quantity\n";
    const rows = vehicles.map((v) => {
      // Escape quotes in strings just in case
      const make = `"${v.make.replace(/"/g, '""')}"`;
      const model = `"${v.model.replace(/"/g, '""')}"`;
      const category = `"${v.category}"`;
      return `${make},${model},${category},${v.price},${v.quantity}`;
    });
    
    const csvString = header + rows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="inventory.csv"');
    return res.status(200).send(csvString);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Export failed" });
  }
}

/**
 * Import vehicles from a CSV string.
 */
export async function importVehicles(req: Request, res: Response) {
  try {
    const csvData = req.body;
    if (typeof csvData !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid CSV payload" });
    }

    const lines = csvData.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      return res.status(400).json({ success: false, message: "No data rows found" });
    }

    const rows = lines.slice(1);
    let addedCount = 0;
    const errors: any[] = [];
    const creatorId = req.user?.userId;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Basic CSV parsing for comma separated fields, removing wrapping quotes
      const cols = row.split(',').map(s => s.trim().replace(/^"|"$/g, ''));

      if (cols.length < 5) {
        errors.push({ row: i + 2, message: "Missing columns" });
        continue;
      }

      const vehicleInput = {
        make: cols[0],
        model: cols[1],
        category: cols[2],
        price: Number(cols[3]),
        quantity: Number(cols[4])
      };

      const parsed = createVehicleSchema.safeParse(vehicleInput);
      if (!parsed.success) {
        errors.push({ row: i + 2, message: "Validation failed", details: parsed.error.issues });
        continue;
      }

      try {
        await createVehicle({
          ...parsed.data,
          createdBy: creatorId ? new Object(creatorId) as any : undefined,
        });
        addedCount++;
      } catch (e: any) {
         errors.push({ row: i + 2, message: e.message || "Failed to save to database" });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Import complete. Added ${addedCount} vehicles.`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Import failed" });
  }
}
