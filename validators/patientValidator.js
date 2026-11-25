
const { body, param, query } = require("express-validator");

const patientIdValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid patient ID")
];

const updatePatientValidator = [
    ...patientIdValidator,

    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Patient name cannot be empty")
        .isLength({ min: 2, max: 100 }),

    body("email")
        .optional({ values: "falsy" })
        .trim()
        .isEmail()
        .withMessage("Invalid email"),

    body("phone")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Phone cannot be empty"),

    body("age")
        .optional()
        .isInt({ min: 0, max: 120 })
        .withMessage("Age must be between 0 and 120"),

    body("gender")
        .optional()
        .isIn(["male", "female", "other"])
        .withMessage("Invalid gender"),

    body("condition")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Medical condition cannot be empty"),

    body("address").optional().trim(),
    body("notes").optional().trim()
];

const patientListValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be at least 1"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid start date"),

    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid end date"),

    query("doctor")
        .optional()
        .isMongoId()
        .withMessage("Invalid doctor ID")
];

module.exports = {
    patientIdValidator,
    updatePatientValidator,
    patientListValidator
};
