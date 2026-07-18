// src/vehicles/vehicle.model.test.ts
// Unit tests for the Vehicle Mongoose schema and model.

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { Vehicle } from "./vehicle.model"; // Not implemented yet

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Vehicle.syncIndexes();
});

afterEach(async () => {
  await Vehicle.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("Vehicle Model", () => {
  const validVehicle = {
    make: "Toyota",
    model: "Camry",
    category: "Sedan",
    price: 25000,
    quantity: 10,
  };

  it("should create and save a valid vehicle successfully", async () => {
    const vehicle = new Vehicle(validVehicle);
    const saved = await vehicle.save();

    expect(saved._id).toBeDefined();
    expect(saved.make).toBe("Toyota");
    expect(saved.model).toBe("Camry");
    expect(saved.category).toBe("Sedan");
    expect(saved.price).toBe(25000);
    expect(saved.quantity).toBe(10);
  });

  it("should default quantity to 0 when not provided", async () => {
    const vehicle = new Vehicle({ ...validVehicle, quantity: undefined });
    const saved = await vehicle.save();
    expect(saved.quantity).toBe(0);
  });

  it("should require make, model, category, and price", async () => {
    const vehicle = new Vehicle({});
    await expect(vehicle.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should reject a price less than 0", async () => {
    const vehicle = new Vehicle({ ...validVehicle, price: -100 });
    await expect(vehicle.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should reject a quantity less than 0", async () => {
    const vehicle = new Vehicle({ ...validVehicle, quantity: -1 });
    await expect(vehicle.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should reject an invalid category", async () => {
    const vehicle = new Vehicle({ ...validVehicle, category: "Spaceship" });
    await expect(vehicle.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should accept all valid categories", async () => {
    const categories = ["Sedan", "SUV", "Truck", "Hatchback", "Coupe", "Convertible", "Van", "Electric"];

    for (const category of categories) {
      const vehicle = new Vehicle({ ...validVehicle, category });
      const saved = await vehicle.save();
      expect(saved.category).toBe(category);
      await Vehicle.deleteMany({}); // clear between iterations
    }
  });

  it("should store an optional createdBy reference to a User", async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    const vehicle = new Vehicle({ ...validVehicle, createdBy: fakeUserId });
    const saved = await vehicle.save();
    expect(saved.createdBy?.toString()).toBe(fakeUserId.toString());
  });

  it("should add createdAt and updatedAt timestamps automatically", async () => {
    const vehicle = await Vehicle.create(validVehicle);
    expect(vehicle.createdAt).toBeDefined();
    expect(vehicle.updatedAt).toBeDefined();
  });
});
