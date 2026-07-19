// src/vehicles/vehicle.validator.ts
// Zod schemas for validating vehicle input data.

import { z } from "zod";

const vehicleCategories = [
  "Sedan",
  "SUV",
  "Truck",
  "Hatchback",
  "Coupe",
  "Convertible",
  "Electric",
  "Compact SUV",
  "MPV",
  "Premium Hatchback",
  "Compact Sedan",
  "Luxury SUV",
  "Luxury Sedan",
] as const;

export const createVehicleSchema = z.object({
  make: z
    .string()
    .trim()
    .min(1, "Make is required")
    .max(100, "Make cannot exceed 100 characters"),

  model: z
    .string()
    .trim()
    .min(1, "Model is required")
    .max(100, "Model cannot exceed 100 characters"),

  category: z.enum(vehicleCategories, {
    message: "Invalid category",
  }),

  price: z.number().min(0, "Price cannot be less than 0"),

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be less than 0")
    .optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const searchVehicleSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.enum(vehicleCategories).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

export const restockVehicleSchema = z.object({
  quantity: z
    .number()
    .int("Restock quantity must be an integer")
    .gt(0, "Restock quantity must be greater than 0"),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type SearchVehicleInput = z.infer<typeof searchVehicleSchema>;
export type RestockVehicleInput = z.infer<typeof restockVehicleSchema>;
