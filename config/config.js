require("dotenv").config(); // Ensure dotenv is loaded

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
  production: {
    username: "eventmanagementdb_user",
    password: "bOpUwAYXrzk4ehFwTIx5rrpKTQHzLCis",
    database: "eventmanagementdb",
    host: "dpg-cs3aut56l47c73ed2s7g-a",
    dialect: "postgres",
  },
};
