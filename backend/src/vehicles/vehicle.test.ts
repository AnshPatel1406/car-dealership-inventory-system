// src/vehicles/vehicle.test.ts
// Integration tests for the Vehicle API endpoints.

import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import app from "../app";
import { User } from "../auth/user.model";
import { Vehicle } from "./vehicle.model";
import jwt from "jsonwebtoken";

let mongoServer: MongoMemoryServer;
let userToken: string;
let adminToken: string;
let adminId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await User.syncIndexes();
  await Vehicle.syncIndexes();

  process.env.JWT_SECRET = "supersecretkeyforvehicletests";

  // Create a regular user and get a token
  const regularUser = await User.create({
    name: "Regular User",
    email: "user@example.com",
    password: "Password123", // Note: stored as plaintext here for simplicity in test mock, or we can hash it. Since we are testing endpoints, we can generate a JWT directly.
    role: "user",
  });
  userToken = jwt.sign(
    { userId: regularUser._id, email: regularUser.email, role: regularUser.role },
    process.env.JWT_SECRET
  );

  // Create an admin user and get a token
  const adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "Password123",
    role: "admin",
  });
  adminId = adminUser._id.toString();
  adminToken = jwt.sign(
    { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
    process.env.JWT_SECRET
  );
});

afterEach(async () => {
  await Vehicle.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ─── POST /api/vehicles (Add Vehicle) ─────────────────────────────────────────

describe("POST /api/vehicles", () => {
  const validPayload = {
    make: "Tesla",
    model: "Model Y",
    category: "SUV" as const,
    price: 55000,
    quantity: 8,
  };

  it("should reject unauthenticated request with 401", async () => {
    const res = await request(app).post("/api/vehicles").send(validPayload);
    expect(res.status).toBe(401);
  });

  it("should reject regular user request with 403 (Admin only)", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send(validPayload);
    expect(res.status).toBe(403);
  });

  it("should reject invalid payload with 400 (Admin)", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "",
        model: "Model Y",
        category: "Spaceship", // invalid enum
        price: -50, // invalid price
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should allow admin to create a vehicle successfully with 201", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.make).toBe("Tesla");
    expect(res.body.data.createdBy).toBe(adminId);
  });
});

// ─── GET /api/vehicles (View All Vehicles) ───────────────────────────────────

describe("GET /api/vehicles", () => {
  it("should reject unauthenticated request with 401", async () => {
    const res = await request(app).get("/api/vehicles");
    expect(res.status).toBe(401);
  });

  it("should allow regular user to view list of vehicles with 200", async () => {
    await Vehicle.create({
      make: "BMW",
      model: "3 Series",
      category: "Sedan",
      price: 45000,
      quantity: 5,
    });

    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].make).toBe("BMW");
  });
});

// ─── GET /api/vehicles/search (Search/Filter Vehicles) ──────────────────────

describe("GET /api/vehicles/search", () => {
  beforeEach(async () => {
    await Vehicle.create({ make: "Honda", model: "Civic", category: "Sedan", price: 22000, quantity: 10 });
    await Vehicle.create({ make: "Toyota", model: "RAV4", category: "SUV", price: 28000, quantity: 5 });
  });

  it("should search vehicles by make with 200", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?make=honda")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].model).toBe("Civic");
  });

  it("should search vehicles by model with 200", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?model=Civic")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].model).toBe("Civic");
  });

  it("should search vehicles by price range with 200", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?minPrice=25000&maxPrice=30000")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].make).toBe("Toyota");
  });
});

// ─── PUT /api/vehicles/:id (Update Vehicle) ──────────────────────────────────

describe("PUT /api/vehicles/:id", () => {
  let vehicleId: string;

  beforeEach(async () => {
    const v = await Vehicle.create({
      make: "Audi",
      model: "A4",
      category: "Sedan",
      price: 40000,
      quantity: 3,
    });
    vehicleId = v._id.toString();
  });

  it("should reject unauthenticated request with 401", async () => {
    const res = await request(app).put(`/api/vehicles/${vehicleId}`).send({ price: 42000 });
    expect(res.status).toBe(401);
  });

  it("should reject regular user request with 403 (Admin only)", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ price: 42000 });
    expect(res.status).toBe(403);
  });

  it("should allow admin to update vehicle with 200", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 42000, quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.price).toBe(42000);
    expect(res.body.data.quantity).toBe(5);
  });

  it("should return 404 if updating non-existent vehicle (Admin)", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/vehicles/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 42000 });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/vehicles/:id (Delete Vehicle) ───────────────────────────────

describe("DELETE /api/vehicles/:id", () => {
  let vehicleId: string;

  beforeEach(async () => {
    const v = await Vehicle.create({
      make: "Nissan",
      model: "Rogue",
      category: "SUV",
      price: 30000,
      quantity: 4,
    });
    vehicleId = v._id.toString();
  });

  it("should reject unauthenticated request with 401", async () => {
    const res = await request(app).delete(`/api/vehicles/${vehicleId}`);
    expect(res.status).toBe(401);
  });

  it("should reject regular user request with 403 (Admin only)", async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("should allow admin to delete vehicle with 200", async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await Vehicle.findById(vehicleId);
    expect(deleted).toBeNull();
  });

  it("should return 404 if deleting non-existent vehicle (Admin)", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/vehicles/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
