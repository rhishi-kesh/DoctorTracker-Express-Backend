const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { query } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");

const statisticsValidator = [
    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid start date"),

    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid end date")
];

router.get("/overview", dashboardController.getOverview);

router.get(
    "/patients-per-doctor",
    dashboardController.getPatientsPerDoctor
);

router.get(
    "/statistics",
    statisticsValidator,
    validateRequest,
    dashboardController.getStatistics
);

module.exports = router;