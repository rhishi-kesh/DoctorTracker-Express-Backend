
const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");

const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// GET ALL PATIENTS
const getPatients = asyncHandler(async (req, res) => {
    const {
        search,
        condition,
        gender,
        doctor,
        startDate,
        endDate
    } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
        const regex = new RegExp(escapeRegex(search), "i");

        filter.$or = [
            { name: regex },
            { email: regex },
            { phone: regex },
            { condition: regex }
        ];
    }

    if (condition) {
        filter.condition = {
            $regex: escapeRegex(condition),
            $options: "i"
        };
    }

    if (gender) {
        filter.gender = gender.toLowerCase();
    }

    if (doctor) {
        filter.doctor = doctor;
    }

    if (startDate || endDate) {
        filter.createdAt = {};

        if (startDate) {
            filter.createdAt.$gte = new Date(startDate);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            filter.createdAt.$lte = end;
        }
    }

    const [patients, total] = await Promise.all([
        Patient.find(filter)
            .populate("doctor", "name specialization hospital")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Patient.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        message: "Patients retrieved successfully",
        data: patients,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
});

// GET SINGLE PATIENT
const getPatientById = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id)
        .populate("doctor", "name specialization hospital")
        .lean();

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: "Patient not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Patient retrieved successfully",
        data: patient
    });
});

// UPDATE PATIENT
const updatePatient = asyncHandler(async (req, res) => {
    const allowedFields = [
        "name",
        "email",
        "phone",
        "age",
        "gender",
        "condition",
        "address",
        "notes"
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide at least one field to update"
        });
    }

    const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        updates,
        {
            new: true,
            runValidators: true
        }
    ).populate("doctor", "name specialization hospital");

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: "Patient not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Patient updated successfully",
        data: patient
    });
});

// DELETE PATIENT
const deletePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: "Patient not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Patient deleted successfully"
    });
});

module.exports = {
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
};
