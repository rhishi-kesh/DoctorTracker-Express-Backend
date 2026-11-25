
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");

// Escape special characters before using user input in a regex.
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// CREATE DOCTOR
const createDoctor = asyncHandler(async (req, res) => {
    const { name, specialization, hospital, phone, email } = req.body;

    const existingDoctor = await Doctor.findOne({
        email: email.toLowerCase()
    });

    if (existingDoctor) {
        return res.status(409).json({
            success: false,
            message: "A doctor with this email already exists"
        });
    }

    const doctor = await Doctor.create({
        name,
        specialization,
        hospital,
        phone,
        email
    });

    res.status(201).json({
        success: true,
        message: "Doctor created successfully",
        data: doctor
    });
});

// GET ALL DOCTORS
const getDoctors = asyncHandler(async (req, res) => {
    const {
        search,
        specialization,
        hospital,
        startDate,
        endDate
    } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Search by name, email, specialization, or hospital.
    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");

        filter.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { specialization: searchRegex },
            { hospital: searchRegex }
        ];
    }

    if (specialization) {
        filter.specialization = {
            $regex: escapeRegex(specialization),
            $options: "i"
        };
    }

    if (hospital) {
        filter.hospital = {
            $regex: escapeRegex(hospital),
            $options: "i"
        };
    }

    // Filter by creation date.
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

    const [doctors, total] = await Promise.all([
        Doctor.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Doctor.countDocuments(filter)
    ]);

    // Get patient counts for the doctors on this page.
    const doctorIds = doctors.map((doctor) => doctor._id);

    const patientCounts = await Patient.aggregate([
        {
            $match: {
                doctor: { $in: doctorIds }
            }
        },
        {
            $group: {
                _id: "$doctor",
                totalPatients: { $sum: 1 }
            }
        }
    ]);

    const countMap = new Map(
        patientCounts.map((item) => [
            item._id.toString(),
            item.totalPatients
        ])
    );

    const result = doctors.map((doctor) => ({
        ...doctor,
        patientCount: countMap.get(doctor._id.toString()) || 0
    }));

    res.status(200).json({
        success: true,
        message: "Doctors retrieved successfully",
        data: result,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
});

// GET SINGLE DOCTOR
const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).lean();

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    const patientCount = await Patient.countDocuments({
        doctor: doctor._id
    });

    res.status(200).json({
        success: true,
        message: "Doctor retrieved successfully",
        data: {
            ...doctor,
            patientCount
        }
    });
});

// UPDATE DOCTOR
const updateDoctor = asyncHandler(async (req, res) => {
    const allowedFields = [
        "name",
        "specialization",
        "hospital",
        "phone",
        "email"
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

    if (updates.email) {
        const existingDoctor = await Doctor.findOne({
            email: updates.email.toLowerCase(),
            _id: { $ne: req.params.id }
        });

        if (existingDoctor) {
            return res.status(409).json({
                success: false,
                message: "Another doctor already uses this email"
            });
        }
    }

    const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        updates,
        {
            new: true,
            runValidators: true
        }
    );

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Doctor updated successfully",
        data: doctor
    });
});

// DELETE DOCTOR
const deleteDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    const assignedPatients = await Patient.countDocuments({
        doctor: doctor._id
    });

    // Do not leave patients with an invalid doctor relationship.
    if (assignedPatients > 0) {
        return res.status(409).json({
            success: false,
            message: "Cannot delete a doctor who has assigned patients",
            assignedPatients
        });
    }

    await doctor.deleteOne();

    res.status(200).json({
        success: true,
        message: "Doctor deleted successfully"
    });
});

// GET DOCTOR'S PATIENTS
const getDoctorPatients = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
        doctor: doctor._id
    };

    if (req.query.search) {
        const searchRegex = new RegExp(
            escapeRegex(req.query.search),
            "i"
        );

        filter.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { condition: searchRegex }
        ];
    }

    const [patients, total] = await Promise.all([
        Patient.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Patient.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        message: "Doctor's patients retrieved successfully",
        doctor: {
            id: doctor._id,
            name: doctor.name
        },
        data: patients,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
});


const addPatientToDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    if (req.body.patientId) {
        const patient = await Patient.findById(req.body.patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        if (patient.doctor) {
            return res.status(409).json({
                success: false,
                message: "Patient is already assigned to a doctor"
            });
        }

        patient.doctor = doctor._id;
        await patient.save();

        return res.status(200).json({
            success: true,
            message: "Existing patient assigned successfully",
            data: patient
        });
    }

    const {
        name,
        email,
        phone,
        age,
        gender,
        condition,
        address,
        notes
    } = req.body;

    const patient = await Patient.create({
        name,
        email,
        phone,
        age,
        gender,
        condition,
        address,
        notes,
        doctor: doctor._id
    });

    res.status(201).json({
        success: true,
        message: "Patient assigned to doctor successfully",
        data: patient
    });
});

const unassignPatientFromDoctor = asyncHandler(async (req, res) => {
    const { id, patientId } = req.params;

    const patient = await Patient.findOne({
        _id: patientId,
        doctor: id
    });

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: "Patient not found under this doctor"
        });
    }

    patient.doctor = null;
    await patient.save();

    res.status(200).json({
        success: true,
        message: "Patient unassigned successfully",
        data: patient
    });
});


module.exports = {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    getDoctorPatients,
    addPatientToDoctor,
    unassignPatientFromDoctor
};
