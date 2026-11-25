
const express = require("express");
const router = express.Router();

const { param } = require("express-validator");

const doctorController = require("../controllers/doctorController");

const {
    createDoctorValidator,
    updateDoctorValidator,
    doctorIdValidator,
    doctorListValidator,
    addPatientToDoctorValidator
} = require("../validators/doctorValidator");

const validateRequest = require("../middlewares/validateRequest");

// POST /api/doctors
router.post(
    "/",
    createDoctorValidator,
    validateRequest,
    doctorController.createDoctor
);

// GET /api/doctors
router.get(
    "/",
    doctorListValidator,
    validateRequest,
    doctorController.getDoctors
);

// GET /api/doctors/:id/patients
router.get(
    "/:id/patients",
    [...doctorIdValidator, ...doctorListValidator],
    validateRequest,
    doctorController.getDoctorPatients
);

// GET /api/doctors/:id
router.get(
    "/:id",
    doctorIdValidator,
    validateRequest,
    doctorController.getDoctorById
);

// PUT /api/doctors/:id
router.put(
    "/:id",
    updateDoctorValidator,
    validateRequest,
    doctorController.updateDoctor
);

// DELETE /api/doctors/:id
router.delete(
    "/:id",
    doctorIdValidator,
    validateRequest,
    doctorController.deleteDoctor
);

// POST /api/doctors/:id/patients
router.post(
    "/:id/patients",
    addPatientToDoctorValidator,
    validateRequest,
    doctorController.addPatientToDoctor
);

// PATCH /api/doctors/:id/patients/:patientId/unassign
router.patch(
    "/:id/patients/:patientId/unassign",
    [
        ...doctorIdValidator,
        param("patientId").isMongoId()
            .withMessage("Invalid patient ID")
    ],
    validateRequest,
    doctorController.unassignPatientFromDoctor
);

module.exports = router;
