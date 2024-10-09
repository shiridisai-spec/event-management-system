const { Pool } = require("pg");
require("dotenv").config(); // Specify the path to the .env file explicitly

// Create a pool for database connection
const pool = new Pool({
  user: process.env.DB_USER, // Your PostgreSQL username
  host: process.env.DB_HOST, // Database host
  database: process.env.DB_DATABASE, // Your database name
  password: process.env.DB_PASSWORD, // Your PostgreSQL password
  port: process.env.DB_PORT, // PostgreSQL default port
});

const createUsersTable = `
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')), -- Default role is 'user' and can only be 'user' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
);
`;

const createEventsTable = `
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_by_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
)
`;

const createRegistrationsTable = `
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) references users(id) ON DELETE CASCADE,
    CONSTRAINT fk_event FOREIGN KEY (event_id) references events(id) ON DELETE CASCADE,
    UNIQUE(user_id, event_id)
)
`;

const createNotificationsTable = `
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
)
`;

const alterTable = `
ALTER TABLE notifications 
ALTER COLUMN event_id DROP NOT NULL;
`;

// Function to create the table
const createTable = async () => {
  try {
    await pool.query(alterTable);
    console.log("Table created or already exists");
  } catch (err) {
    console.error("Error creating table", err);
  }
};

// Test connection before creating the table
// createTable();

// Test the database connection
const testConnection = async () => {
  try {
    const client = await pool.connect(); // Get a client from the pool
    console.log("Connected to the database successfully");
    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error("Database connection error:", err.stack);
  }
};

// Call the test connection function
testConnection();

// Export the pool and connection function
module.exports = {
  pool,
};
