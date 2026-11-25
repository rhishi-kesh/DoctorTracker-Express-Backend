
const express = require("express");
const router = express.Router();

const patientController = require("../controllers/patientController");

const {
    patientIdValidator,
    updatePatientValidator,
    patientListValidator
} = require("../validators/patientValidator");

const validateRequest = require("../middlewares/validateRequest");

// GET /api/patients
router.get(
    "/",
    patientListValidator,
    validateRequest,
    patientController.getPatients
);

// GET /api/patients/:id
router.get(
    "/:id",
    patientIdValidator,
    validateRequest,
    patientController.getPatientById
);

// PUT /api/patients/:id
router.put(
    "/:id",
    updatePatientValidator,
    validateRequest,
    patientController.updatePatient
);

// DELETE /api/patients/:id
router.delete(
    "/:id",
    patientIdValidator,
    validateRequest,
    patientController.deletePatient
);

module.exports = router;
