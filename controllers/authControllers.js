const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db/connect");
const queries = require("../queries/authQueries");

const BadRequestError = require("../errors/bad-request"); // Custom error class
const UnauthenticatedError = require("../errors/unauthenticated"); // Custom error class
const CustomAPIError = require("../errors/custom-api");

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    throw new BadRequestError("All fields are required");
  }

  // Ensure that role is either user or admin
  if (role !== "user" && role !== "admin") {
    throw new BadRequestError("Role must either be user or admin");
  }

  try {
    // Check if the email already exists
    const emailCheck = await pool.query(queries.checkIfEmailExists, [email]);
    if (emailCheck.rowCount > 0) {
      console.log("emailCheck====>", emailCheck);
      throw new BadRequestError("Email already exists.");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert a new user/admin into database
    const newUserOrAdmin = await pool.query(queries.createUserOrAdmin, [
      name,
      email,
      hashedPassword,
      role,
    ]);

    // Generate a JWT token
    const token = jwt.sign(
      {
        id: newUserOrAdmin?.rows[0]?.id,
        name: newUserOrAdmin?.rows[0]?.name,
        email: newUserOrAdmin?.rows[0]?.email,
        role: newUserOrAdmin?.rows[0]?.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );

    // Successful creation of user/admin
    res.status(StatusCodes.CREATED).json({
      message: "Registration successful",
      user: {
        id: newUserOrAdmin?.rows[0]?.id,
        name: newUserOrAdmin?.rows[0]?.name,
        email: newUserOrAdmin?.rows[0]?.email,
        role: newUserOrAdmin?.rows[0]?.role,
      },
      token,
    });
  } catch (error) {
    console.log("Error registering:", error);

    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // Basic validation
  if (!email || !password) {
    throw new BadRequestError("All fields are required");
  }
  try {
    // Check if email exists
    const emailCheck = await pool.query(queries.checkIfEmailExists, [email]);
    if (emailCheck.rowCount === 0) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    const user = emailCheck.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    // Generate a JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log("error", error);
    if (error instanceof CustomAPIError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Server error",
      });
    }
  }
};

module.exports = {
  register,
  login,
};
