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
