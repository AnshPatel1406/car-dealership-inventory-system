import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app";

describe("POST /api/auth/register", () => {
  it("should register a new user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "John Doe",
        email: "john@example.com",
        password: "Password123",
      });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      success: true,
      message: "User registered successfully",
    });
  });

  it("should reject an invalid request body", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "",
        email: "invalid-email",
        password: "123",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});