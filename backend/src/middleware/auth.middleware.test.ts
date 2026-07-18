// src/middleware/auth.middleware.test.ts
// Unit tests for authenticate and authorizeAdmin middleware.
// Uses mock req/res/next objects — no DB needed.

import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { authenticate, authorizeAdmin } from "./auth.middleware"; // Not implemented yet

const JWT_SECRET = "test-secret-for-middleware";

// ─── Helpers ───────────────────────────────────────────────────────────────

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    ...overrides,
  } as Request;
}

function mockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

const mockNext: NextFunction = vi.fn();

function makeValidToken(payload = { userId: "abc123", email: "test@example.com", role: "user" }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// ─── authenticate middleware ───────────────────────────────────────────────

describe("authenticate middleware", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("should return 401 when no Authorization header is present", () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header is not Bearer format", () => {
    const req = mockReq({ headers: { authorization: "Basic sometoken" } });
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("should return 401 when token is invalid/malformed", () => {
    const req = mockReq({ headers: { authorization: "Bearer this.is.not.valid" } });
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("should return 401 when token is expired", () => {
    const expiredToken = jwt.sign(
      { userId: "abc123", email: "test@example.com", role: "user" },
      JWT_SECRET,
      { expiresIn: -1 } // already expired
    );
    const req = mockReq({ headers: { authorization: `Bearer ${expiredToken}` } });
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should call next() and attach user to req when token is valid", () => {
    const token = makeValidToken();
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user!.userId).toBe("abc123");
    expect(req.user!.email).toBe("test@example.com");
    expect(req.user!.role).toBe("user");
  });
});

// ─── authorizeAdmin middleware ─────────────────────────────────────────────

describe("authorizeAdmin middleware", () => {
  it("should return 403 when user is not an admin", () => {
    const req = mockReq();
    req.user = { userId: "abc123", email: "user@example.com", role: "user" };
    const res = mockRes();

    authorizeAdmin(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("should return 403 when req.user is not set (unauthenticated)", () => {
    const req = mockReq(); // no user attached
    const res = mockRes();

    authorizeAdmin(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should call next() when user role is admin", () => {
    const req = mockReq();
    req.user = { userId: "xyz789", email: "admin@example.com", role: "admin" };
    const res = mockRes();
    const next = vi.fn();

    authorizeAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
