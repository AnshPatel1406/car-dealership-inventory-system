import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { User } from "./user.model";
import { registerUser, loginUser } from "./auth.service"; // Not Added Yet for TDD:Red

// ─── In-Memory MongoDB setup ───────────────────────────────────────────────
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Set JWT secret for tests
  process.env.JWT_SECRET = "test-secret-key-for-jwt";
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Failing Tests for  registerUser  

describe("registerUser", () => {
  it("should hash the password before saving (never store plaintext)", async () => {
    const result = await registerUser({
      name: "John Doe",
      email: "john@example.com",
      password: "Password123",
    });

    // Fetch the user directly from DB to check the stored password
    const userInDb = await User.findById(result._id);
    expect(userInDb).not.toBeNull();
    expect(userInDb!.password).not.toBe("Password123");

    // Verify the hash is valid bcrypt
    const isMatch = await bcrypt.compare("Password123", userInDb!.password);
    expect(isMatch).toBe(true);
  });

  it("should save the user to MongoDB and return user data without password", async () => {
    const result = await registerUser({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Password123",
    });

    expect(result._id).toBeDefined();
    expect(result.name).toBe("Jane Doe");
    expect(result.email).toBe("jane@example.com");
    // Password should NOT be in the returned object
    expect((result as any).password).toBeUndefined();
  });

  it("should throw an error if the email already exists", async () => {
    await registerUser({
      name: "First User",
      email: "duplicate@example.com",
      password: "Password123",
    });

    await expect(
      registerUser({
        name: "Second User",
        email: "duplicate@example.com",
        password: "Password456",
      })
    ).rejects.toThrow();
  });

  it("should default role to 'user'", async () => {
    const result = await registerUser({
      name: "Regular User",
      email: "regular@example.com",
      password: "Password123",
    });

    const userInDb = await User.findById(result._id);
    expect(userInDb!.role).toBe("user");
  });
});

// Failing Tests for  loginUser  

describe("loginUser", () => {
  // Seed a user before each login test
  const testUser = {
    name: "Login User",
    email: "login@example.com",
    password: "CorrectPassword123",
  };

  it("should return a valid JWT token on correct credentials", async () => {
    await registerUser(testUser);

    const result = await loginUser({
      email: "login@example.com",
      password: "CorrectPassword123",
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");

    // Verify the JWT payload contains user info
    const decoded = jwt.verify(result.token, process.env.JWT_SECRET!) as any;
    expect(decoded.userId).toBeDefined();
    expect(decoded.email).toBe("login@example.com");
    expect(decoded.role).toBe("user");
  });

  it("should throw an error if the email does not exist", async () => {
    await expect(
      loginUser({
        email: "nonexistent@example.com",
        password: "Password123",
      })
    ).rejects.toThrow("Invalid email or password");
  });

  it("should throw an error if the password is incorrect", async () => {
    await registerUser(testUser);

    await expect(
      loginUser({
        email: "login@example.com",
        password: "WrongPassword123",
      })
    ).rejects.toThrow("Invalid email or password");
  });
});
