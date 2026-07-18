// src/vehicles/vehicle.service.test.ts
// Unit tests for the vehicle service business logic (CRUD operations).

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import { Vehicle } from "./vehicle.model";
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

describe("Vehicle Service", () => {
  const dummyUser = new mongoose.Types.ObjectId();

  const mockVehicleData = {
    make: "Tesla",
    model: "Model 3",
    category: "Electric" as const,
    price: 45000,
    quantity: 5,
    createdBy: dummyUser,
  };

  describe("createVehicle", () => {
    it("should successfully create a vehicle and return it", async () => {
      const vehicle = await createVehicle(mockVehicleData);

      expect(vehicle._id).toBeDefined();
      expect(vehicle.make).toBe("Tesla");
      expect(vehicle.price).toBe(45000);
      expect(vehicle.createdBy?.toString()).toBe(dummyUser.toString());
    });
  });

  describe("getAllVehicles", () => {
    it("should return a list of all vehicles", async () => {
      await createVehicle(mockVehicleData);
      await createVehicle({ ...mockVehicleData, model: "Model S", price: 80000 });

      const vehicles = await getAllVehicles();
      expect(vehicles.length).toBe(2);
      expect(vehicles.map((v) => v.model)).toContain("Model 3");
      expect(vehicles.map((v) => v.model)).toContain("Model S");
    });

    it("should return an empty array if no vehicles exist", async () => {
      const vehicles = await getAllVehicles();
      expect(vehicles).toEqual([]);
    });
  });

  describe("getVehicleById", () => {
    it("should return a single vehicle by ID", async () => {
      const created = await createVehicle(mockVehicleData);
      const fetched = await getVehicleById(created._id.toString());

      expect(fetched).not.toBeNull();
      expect(fetched!._id.toString()).toBe(created._id.toString());
    });

    it("should return null if the vehicle does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const fetched = await getVehicleById(fakeId);

      expect(fetched).toBeNull();
    });
  });

  describe("searchVehicles", () => {
    beforeEach(async () => {
      await createVehicle({ make: "Honda", model: "Civic", category: "Sedan", price: 20000, quantity: 1 });
      await createVehicle({ make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 2 });
      await createVehicle({ make: "Ford", model: "F-150", category: "Truck", price: 40000, quantity: 3 });
    });

    it("should filter vehicles by make", async () => {
      const results = await searchVehicles({ make: "Honda" });
      expect(results.length).toBe(1);
      expect(results[0].make).toBe("Honda");
    });

    it("should filter vehicles by category", async () => {
      const results = await searchVehicles({ category: "Sedan" });
      expect(results.length).toBe(2);
    });

    it("should filter vehicles by model", async () => {
      const results = await searchVehicles({ model: "Civic" });
      expect(results.length).toBe(1);
      expect(results[0].model).toBe("Civic");
    });

    it("should filter vehicles by minimum price", async () => {
      const results = await searchVehicles({ minPrice: 25000 });
      expect(results.length).toBe(2); // Camry (25000) and F-150 (40000)
    });

    it("should filter vehicles by maximum price", async () => {
      const results = await searchVehicles({ maxPrice: 30000 });
      expect(results.length).toBe(2); // Civic (20000) and Camry (25000)
    });

    it("should filter vehicles by price range (minPrice and maxPrice)", async () => {
      const results = await searchVehicles({ minPrice: 22000, maxPrice: 35000 });
      expect(results.length).toBe(1); // Camry (25000)
    });
  });

  describe("updateVehicle", () => {
    it("should update a vehicle's properties and return the updated document", async () => {
      const created = await createVehicle(mockVehicleData);

      const updated = await updateVehicle(created._id.toString(), {
        price: 40000,
        quantity: 10,
      });

      expect(updated).not.toBeNull();
      expect(updated!.price).toBe(40000);
      expect(updated!.quantity).toBe(10);
      expect(updated!.make).toBe("Tesla"); // Remains unchanged
    });

    it("should return null if updating a non-existent vehicle", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updated = await updateVehicle(fakeId, { price: 100 });
      expect(updated).toBeNull();
    });
  });

  describe("deleteVehicle", () => {
    it("should delete a vehicle and return true", async () => {
      const created = await createVehicle(mockVehicleData);

      const isDeleted = await deleteVehicle(created._id.toString());
      expect(isDeleted).toBe(true);

      const fetched = await getVehicleById(created._id.toString());
      expect(fetched).toBeNull();
    });

    it("should return false if deleting a non-existent vehicle", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const isDeleted = await deleteVehicle(fakeId);
      expect(isDeleted).toBe(false);
    });
  });

  describe("purchaseVehicle", () => {
    it("should decrease vehicle quantity by 1 upon purchase", async () => {
      const created = await createVehicle(mockVehicleData); // quantity: 5
      const purchased = await purchaseVehicle(created._id.toString());
      
      expect(purchased.quantity).toBe(4);

      const fetched = await getVehicleById(created._id.toString());
      expect(fetched!.quantity).toBe(4);
    });

    it("should throw an error if vehicle is out of stock (quantity is 0)", async () => {
      const created = await createVehicle({ ...mockVehicleData, quantity: 0 });
      await expect(purchaseVehicle(created._id.toString())).rejects.toThrow("Vehicle is out of stock");
    });

    it("should throw an error if vehicle does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(purchaseVehicle(fakeId)).rejects.toThrow("Vehicle not found");
    });
  });

  describe("restockVehicle", () => {
    it("should increase vehicle quantity by given amount upon restocking", async () => {
      const created = await createVehicle(mockVehicleData); // quantity: 5
      const restocked = await restockVehicle(created._id.toString(), 10);
      
      expect(restocked.quantity).toBe(15);

      const fetched = await getVehicleById(created._id.toString());
      expect(fetched!.quantity).toBe(15);
    });

    it("should throw an error if restocking amount is invalid (less than or equal to 0)", async () => {
      const created = await createVehicle(mockVehicleData);
      await expect(restockVehicle(created._id.toString(), 0)).rejects.toThrow("Restock quantity must be greater than 0");
      await expect(restockVehicle(created._id.toString(), -5)).rejects.toThrow("Restock quantity must be greater than 0");
    });

    it("should throw an error if vehicle does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(restockVehicle(fakeId, 10)).rejects.toThrow("Vehicle not found");
    });
  });
});
