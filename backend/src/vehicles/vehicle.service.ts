// src/vehicles/vehicle.service.ts
// Business logic for vehicle CRUD operations.

import { Vehicle, IVehicle } from "./vehicle.model";

/**
 * Creates a new vehicle in the inventory.
 */
export async function createVehicle(data: Partial<IVehicle>) {
  const vehicle = new Vehicle(data);
  return await vehicle.save();
}

/**
 * Retrieves all vehicles from the inventory.
 */
export async function getAllVehicles(): Promise<IVehicle[]> {
  return await Vehicle.find().sort({ createdAt: -1 });
}

/**
 * Retrieves a single vehicle by its ID.
 */
export async function getVehicleById(id: string): Promise<IVehicle | null> {
  return await Vehicle.findById(id);
}

/**
 * Searches and filters vehicles by make and/or category.
 */
export async function searchVehicles(filters: {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<IVehicle[]> {
  const query: any = {};
  
  if (filters.make) {
    // Case-insensitive regex search for make
    query.make = { $regex: new RegExp(filters.make, "i") };
  }

  if (filters.model) {
    // Case-insensitive regex search for model
    query.model = { $regex: new RegExp(filters.model, "i") };
  }
  
  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      query.price.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      query.price.$lte = filters.maxPrice;
    }
  }
  
  return await Vehicle.find(query).sort({ createdAt: -1 });
}

/**
 * Updates a vehicle's details by ID.
 * Returns the updated vehicle or null if not found.
 */
export async function updateVehicle(id: string, updateData: Partial<IVehicle>): Promise<IVehicle | null> {
  return await Vehicle.findByIdAndUpdate(id, updateData, { 
    returnDocument: "after", // Return the modified document rather than the original
    runValidators: true // Ensure validations run on update
  });
}

/**
 * Deletes a vehicle by ID.
 * Returns true if a vehicle was deleted, false otherwise.
 */
export async function deleteVehicle(id: string): Promise<boolean> {
  const result = await Vehicle.findByIdAndDelete(id);
  return result !== null;
}
