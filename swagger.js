// // swagger.js
// const swaggerJsdoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Event Management System API",
//       version: "1.0.0",
//       description: "API documentation for Event Management System",
//     },
//     servers: [
//       {
//         url: "http://localhost:5000", // Update this to your deployed server URL
//       },
//     ],
//   },
//   apis: ["./routes/*.js"], // Path to your API routes
// };

// const swaggerSpec = swaggerJsdoc(options);

// const swaggerDocs = (app) => {
//   app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// };

// module.exports = swaggerDocs;

const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Event Management System API",
    description: "API documentation for the Event Management System",
  },
  host: "localhost:3000", // Change this based on your environment
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
  "./routes/authRoutes.js",
  "./routes/eventRoutes.js",
  "./routes/notificationRoutes.js",
]; // Add all your route files here

// Generate Swagger output
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./app"); // Adjust the path to your main server file
});
