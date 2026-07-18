import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { User } from "./user.model";

// ─── In-Memory MongoDB setup ───────────────────────────────────────────────
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  // Clean up between tests so each test starts fresh
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("User Model", () => {
  it("should create and save a valid user successfully", async () => {
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      password: "hashedPassword123",
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe("John Doe");
    expect(savedUser.email).toBe("john@example.com");
    expect(savedUser.password).toBe("hashedPassword123");
  });

  it("should default role to 'user' when not provided", async () => {
    const user = new User({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "hashedPassword123",
    });
    const savedUser = await user.save();

    expect(savedUser.role).toBe("user");
  });

  it("should allow setting role to 'admin'", async () => {
    const user = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "hashedPassword123",
      role: "admin",
    });
    const savedUser = await user.save();

    expect(savedUser.role).toBe("admin");
  });

  it("should reject saving a user with a duplicate email", async () => {
    await User.create({
      name: "First User",
      email: "duplicate@example.com",
      password: "hashedPassword123",
    });

    const duplicate = new User({
      name: "Second User",
      email: "duplicate@example.com",
      password: "anotherHash",
    });

    await expect(duplicate.save()).rejects.toThrow();
  });

  it("should require name, email, and password", async () => {
    const user = new User({});
    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should reject an invalid role value", async () => {
    const user = new User({
      name: "Bad Role User",
      email: "badrole@example.com",
      password: "hashedPassword123",
      role: "superuser", // invalid
    });
    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should reject a malformed email address", async () => {
    const invalidEmails = ["notanemail", "missing@", "@nodomain.com", "no spaces@test.com"];

    for (const email of invalidEmails) {
      const user = new User({
        name: "Bad Email User",
        email,
        password: "hashedPassword123",
      });
      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    }
  });

  it("should add createdAt and updatedAt timestamps automatically", async () => {
    const user = await User.create({
      name: "Timestamp User",
      email: "timestamps@example.com",
      password: "hashedPassword123",
    });

    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });
});
