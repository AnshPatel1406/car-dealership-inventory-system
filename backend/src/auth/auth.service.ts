// Actual Business Logic Here

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User } from "./user.model";
import type { RegisterInput, LoginInput } from "./auth.validator";

/**
 * Registers a new user — hashes password, saves to MongoDB,
 * and returns user data without the password field.
 */
export async function registerUser(data: RegisterInput) {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new Error("Email already registered");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to MongoDB
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    // Return user data without password
    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;
    return userWithoutPassword;
}

/**
 * Authenticates a user — verifies credentials and returns a signed JWT.
 */
export async function loginUser(data: LoginInput) {
    const { email, password } = data;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    // Sign and return JWT
    const token = jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
    );

    return { token };
}

/**
 * Authenticates a user via Google OAuth credential (ID token).
 * Creates a new user account if they don't exist.
 */
export async function googleAuthUser(credential: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify the token
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new Error("Invalid Google token payload");
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || "Google User";

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
        // Create user with a random unguessable password
        const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user", // Default to standard user
        });
    }

    // Sign and return JWT
    const token = jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
    );

    return { token };
}