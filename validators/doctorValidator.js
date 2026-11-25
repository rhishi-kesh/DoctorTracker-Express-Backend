
const { body, param, query } = require("express-validator");

const createDoctorValidator = [
    body("name")
        .trim()
        .notEmpty().withMessage("Doctor name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Name must be between 3 and 100 characters"),

    body("specialization")
        .trim()
        .notEmpty().withMessage("Specialization is required")
        .isLength({ max: 100 })
        .withMessage("Specialization cannot exceed 100 characters"),

    body("hospital")
        .trim()
        .notEmpty().withMessage("Hospital name is required")
        .isLength({ max: 150 })
        .withMessage("Hospital name cannot exceed 150 characters"),

    body("phone")
        .trim()
        .notEmpty().withMessage("Phone number is required")
        .isLength({ max: 20 })
        .withMessage("Phone number cannot exceed 20 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail()
        .isLength({ max: 254 })
        .withMessage("Email cannot exceed 254 characters")
];

const updateDoctorValidator = [
    param("id").isMongoId().withMessage("Invalid doctor ID"),

    body("name")
        .optional()
        .trim()
        .notEmpty().withMessage("Name cannot be empty")
        .isLength({ min: 3, max: 100 })
        .withMessage("Name must be between 3 and 100 characters"),

    body("specialization")
        .optional()
        .trim()
        .notEmpty().withMessage("Specialization cannot be empty")
        .isLength({ max: 100 }),

    body("hospital")
        .optional()
        .trim()
        .notEmpty().withMessage("Hospital cannot be empty")
        .isLength({ max: 150 }),

    body("phone")
        .optional()
        .trim()
        .notEmpty().withMessage("Phone cannot be empty")
        .isLength({ max: 20 }),

    body("email")
        .optional()
        .trim()
        .notEmpty().withMessage("Email cannot be empty")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail()
        .isLength({ max: 254 })
];

const doctorIdValidator = [
    param("id").isMongoId().withMessage("Invalid doctor ID")
];

const doctorListValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 }).withMessage("Page must be at least 1"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("startDate")
        .optional()
        .isISO8601().withMessage("Invalid start date"),

    query("endDate")
        .optional()
        .isISO8601().withMessage("Invalid end date")
];


const addPatientToDoctorValidator = [
    param("id").isMongoId().withMessage("Invalid doctor ID"),

    body("patientId")
        .optional()
        .isMongoId()
        .withMessage("Invalid patient ID"),

    body("name")
        .if((value, { req }) => !req.body.patientId)
        .trim()
        .notEmpty().withMessage("Patient name is required")
        .isLength({ min: 2, max: 100 }),

    body("email")
        .if((value, { req }) => !req.body.patientId)
        .optional({ checkFalsy: true })
        .trim()
        .isEmail().withMessage("Invalid patient email"),

    body("phone")
        .if((value, { req }) => !req.body.patientId)
        .trim()
        .notEmpty().withMessage("Patient phone is required")
        .isLength({ max: 20 }),

    body("age")
        .if((value, { req }) => !req.body.patientId)
        .notEmpty().withMessage("Patient age is required")
        .isInt({ min: 0, max: 120 })
        .withMessage("Age must be between 0 and 120"),

    body("gender")
        .if((value, { req }) => !req.body.patientId)
        .trim()
        .notEmpty()
        .isIn(["male", "female", "other"])
        .withMessage("Invalid gender"),

    body("condition")
        .if((value, { req }) => !req.body.patientId)
        .trim()
        .notEmpty().withMessage("Medical condition is required"),

    body("address").optional().trim(),
    body("notes").optional().trim()
];


module.exports = {
    createDoctorValidator,
    updateDoctorValidator,
    doctorIdValidator,
    doctorListValidator,
    addPatientToDoctorValidator
};
