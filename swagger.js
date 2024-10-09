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
