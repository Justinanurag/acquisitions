import logger from "#config/logger.js";
import { formatValidationError } from "#utils/format.js";
import { signupSchema,signInSchema } from "#validations/auth.validations.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signUp = async (req, res, next) => {
  try {
    // ================= VALIDATION =================
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

    // ================= BUSINESS LOGIC =================
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userService.create({
      name,
      email,
      role,
      password: hashedPassword,
    });

    logger.info(`User registered successfully: ${email}`);

    // ================= RESPONSE =================
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
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


export const signIn = async (req, res, next) => {
  try {
    // ================= VALIDATION =================
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

    // ================= USER CHECK =================
    const user = await userService.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Optional: account status check
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    // ================= PASSWORD CHECK =================
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ================= TOKEN =================
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ================= RESPONSE =================
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
