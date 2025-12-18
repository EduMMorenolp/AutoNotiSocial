const express = require("express");
const cors = require("cors");
const { apiLogger } = require("../utils/logger");

// Import routes
const sourcesRoutes = require("./routes/sources");
const articlesRoutes = require("./routes/articles");
const summariesRoutes = require("./routes/summaries");
const publicationsRoutes = require("./routes/publications");
const schedulerRoutes = require("./routes/scheduler");
const settingsRoutes = require("./routes/settings");
const logsRoutes = require("./routes/logs");
const templatesRoutes = require("./routes/templates");

/**
 * Create and configure Express app
 * @returns {Express} Express application
 */
function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (req.path !== "/api/health") {
        apiLogger.debug(`${req.method} ${req.path}`, {
          status: res.statusCode,
          duration: `${duration}ms`,
        });
      }
    });
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API Routes
  app.use("/api/sources", sourcesRoutes);
  app.use("/api/articles", articlesRoutes);
  app.use("/api/summaries", summariesRoutes);
  app.use("/api/publications", publicationsRoutes);
  app.use("/api/scheduler", schedulerRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/logs", logsRoutes);
  app.use("/api/templates", templatesRoutes);

  // 404 handler
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      error: "Endpoint not found",
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    apiLogger.error("Unhandled error", err);
    res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  });

  return app;
}

module.exports = { createApp };
