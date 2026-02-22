import logger from "#config/logger.js";
import { db } from "#config/database.js";
import { eq } from "drizzle-orm";
import { formatValidationError } from "#utils/format.js";
import { signupSchema, signInSchema } from "#validations/auth.validations.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "#models/user.model.js";

// ================= SIGN UP =================
export const signUp = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: formatValidationError(validationResult.error).errors,
      });
    }

    let { name, email, role, password } = validationResult.data;
    email = email.toLowerCase().trim();

    // 🔹 Check if user already exists
    const existingUserResult = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .limit(1);
    const existingUser = existingUserResult[0];
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Create user
    const [user] = await db
      .insert(User)
      .values({
        name,
        email,
        role,
        password: hashedPassword,
      })
      .returning();

    logger.info(`User registered successfully: ${email}`);
    const token=jwt.sign(
      {id:user.id,email:user.email,password:user.password},
      process.env.JWT_SECRET,
      {expiresIn:'1d'}
    );

    // res.cookies.set(res,'token',token);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Signup error", error);
    next(error);
  }
};

// ================= SIGN IN =================
export const signIn = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: formatValidationError(validationResult.error).errors,
      });
    }

    let { email, password } = validationResult.data;
    email = email.toLowerCase().trim();

    // 🔹 Fetch user
    const userResult = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .limit(1);
    const user = userResult[0];
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token=jwt.sign(
      {id:user.id,email:user.email,password:user.password},
      process.env.JWT_SECRET,
      {expiresIn:'1d'}
    );
// res.cookies.set(res,'token',token);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    logger.error("Signin error", error);
    next(error);
  }
};
