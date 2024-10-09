require("dotenv").config();
require("express-async-errors");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json"); // Generated Swagger file
const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// connect
const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/auth");

// routers
const authRouter = require("./routes/authRoutes");
const eventRouter = require("./routes/eventRoutes");
const notificationRouter = require("./routes/notificationRoutes");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    window: 15 * 60 * 1000, //15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(helmet());
// app.use(cors());

app.use(
  cors({
    origin: "*", // Allow all origins (for testing purposes)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow necessary HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  })
);
app.use(xss());

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/events", authenticateUser, eventRouter);
app.use("/api/v1/events/notifications", authenticateUser, notificationRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// swaggerDocs(app); // Serve Swagger docs

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    // await connectDB(); // Ensure database connection before starting the server
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
