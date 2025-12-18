const express = require("express");
const router = express.Router();
// Desde src/api/routes hasta src/database son dos niveles arriba
const { TEMPLATES, getAllTemplates } = require("../../database/templates");

/**
 * GET /api/templates
 * Obtiene todas las plantillas organizadas por categoría
 */
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      data: TEMPLATES,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/templates/all
 * Obtiene todas las plantillas en un array plano
 */
router.get("/all", (req, res) => {
  try {
    res.json({
      success: true,
      data: getAllTemplates(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
