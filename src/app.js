import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import swaggerUi from "swagger-ui-express";
import "./config/passport.config.js";
import productsRouter from "./routes/products.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import ordersRouter from "./routes/orders.router.js";
import deliveriesRouter from "./routes/deliveries.router.js";
import usersRouter from "./routes/users.router.js";
import mocksRouter from "./routes/mocks.router.js";
import { config } from "./config/index.js";
import { swaggerSpecs } from "./docs/swagger.config.js";
import loggerRouter from "./routes/logger.router.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Servidor activo" });
});

// Documentación interactiva (Swagger UI)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { customSiteTitle: "ShipNow API Docs" }));

app.use("/api/products", productsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/deliveries", deliveriesRouter);

// Herramienta interna para verificar el logger (genera un log de cada nivel).
app.use("/api/loggerTest", loggerRouter);

// Herramienta de desarrollo: no se expone en producción.
if (!config.isProduction) {
  app.use("/api/mocks", mocksRouter);
}

app.use(notFoundHandler);

// SIEMPRE al final: Express lo reconoce como manejador de errores por tener 4 parámetros.
app.use(errorHandler);

export default app;