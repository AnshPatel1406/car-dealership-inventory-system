import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { describe, expect, it, beforeAll, afterAll, afterEach } from "vitest";
import app from "../app";
import { User } from "./user.model";

// ─── In-Memory MongoDB for integration tests ──────────────────────────────
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await User.syncIndexes();

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

// ─── POST /api/auth/register ───────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("should register a new user and return user data without password", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("John Doe");
    expect(response.body.data.email).toBe("john@example.com");
    // Password must never be exposed in API response
    expect(response.body.data.password).toBeUndefined();
  });

  it("should persist the user to the database", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Password123",
    });

    const userInDb = await User.findOne({ email: "jane@example.com" });
    expect(userInDb).not.toBeNull();
    expect(userInDb!.name).toBe("Jane Doe");
  });

  it("should reject duplicate email with 409", async () => {
    await request(app).post("/api/auth/register").send({
      name: "First User",
      email: "duplicate@example.com",
      password: "Password123",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email: "duplicate@example.com",
      password: "Password456",
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("should reject invalid input with 400", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "",
      email: "invalid-email",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  // Seed a user before login tests
  const testUser = {
    name: "Login User",
    email: "login@example.com",
    password: "CorrectPassword123",
  };

  it("should return a JWT token on valid credentials", async () => {
    // First register the user
    await request(app).post("/api/auth/register").send(testUser);

    const response = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "CorrectPassword123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(typeof response.body.token).toBe("string");
  });

  it("should reject non-existent email with 401", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject wrong password with 401", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const response = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "WrongPassword123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject invalid input with 400", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

// ─── POST /api/auth/google ──────────────────────────────────────────────────

vi.mock("google-auth-library", () => {
  const verifyIdTokenMock = vi.fn().mockImplementation((opts) => {
    if (opts.idToken === "valid-new-user-token") {
      return Promise.resolve({
        getPayload: () => ({ email: "googleuser@example.com", name: "Google User" })
      });
    }
    if (opts.idToken === "valid-existing-user-token") {
      return Promise.resolve({
        getPayload: () => ({ email: "existing@example.com", name: "Existing User" })
      });
    }
    return Promise.reject(new Error("Invalid token"));
  });

  return {
    OAuth2Client: vi.fn().mockImplementation(() => ({
      verifyIdToken: verifyIdTokenMock
    }))
  };
});

describe("POST /api/auth/google", () => {
  it("should create a new user and return JWT when token is valid but user does not exist", async () => {
    const response = await request(app).post("/api/auth/google").send({
      credential: "valid-new-user-token"
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();

    const userInDb = await User.findOne({ email: "googleuser@example.com" });
    expect(userInDb).not.toBeNull();
    expect(userInDb!.name).toBe("Google User");
  });

  it("should return JWT without creating a duplicate user when token is valid and user exists", async () => {
    await User.create({
      name: "Existing User",
      email: "existing@example.com",
      password: "somehashedpassword",
    });

    const response = await request(app).post("/api/auth/google").send({
      credential: "valid-existing-user-token"
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();

    const users = await User.find({ email: "existing@example.com" });
    expect(users.length).toBe(1);
  });

  it("should reject invalid google credential with 401", async () => {
    const response = await request(app).post("/api/auth/google").send({
      credential: "invalid-token"
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should require credential field", async () => {
    const response = await request(app).post("/api/auth/google").send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});