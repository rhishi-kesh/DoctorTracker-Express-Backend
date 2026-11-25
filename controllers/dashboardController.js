const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/dashboard/overview
const getOverview = asyncHandler(async (req, res) => {
    const [
        totalDoctors,
        totalPatients,
        unassignedPatients
    ] = await Promise.all([
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Patient.countDocuments({ doctor: null })
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalDoctors,
            totalPatients,
            unassignedPatients,
            assignedPatients: totalPatients - unassignedPatients
        }
    });
});

// GET /api/dashboard/patients-per-doctor
const getPatientsPerDoctor = asyncHandler(async (req, res) => {
    const doctors = await Doctor.aggregate([
        {
            $lookup: {
                from: "patients",
                let: { doctorId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$doctor", "$$doctorId"]
                            }
                        }
                    },
                    {
                        $count: "total"
                    }
                ],
                as: "patientStats"
            }
        },
        {
            $project: {
                name: 1,
                specialization: 1,
                hospital: 1,
                patientCount: {
                    $ifNull: [
                        { $arrayElemAt: ["$patientStats.total", 0] },
                        0
                    ]
                }
            }
        },
        {
            $sort: { patientCount: -1, name: 1 }
        }
    ]);

    res.status(200).json({
        success: true,
        data: doctors
    });
});

// GET /api/dashboard/statistics
const getStatistics = asyncHandler(async (req, res) => {
    const now = new Date();

    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);

    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : now;

    // Include the entire end date.
    if (req.query.endDate) {
        endDate.setUTCHours(23, 59, 59, 999);
    }

    if (startDate > endDate) {
        return res.status(400).json({
            success: false,
            message: "Start date cannot be after end date"
        });
    }

    const dateFilter = {
        $gte: startDate,
        $lte: endDate
    };

    const [doctorStats, patientStats] = await Promise.all([
        Doctor.aggregate([
            {
                $match: {
                    createdAt: dateFilter
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),

        Patient.aggregate([
            {
                $match: {
                    createdAt: dateFilter
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])
    ]);

    res.status(200).json({
        success: true,
        data: {
            period: {
                startDate,
                endDate
            },
            doctors: doctorStats,
            patients: patientStats
        }
    });
});

module.exports = {
    getOverview,
    getPatientsPerDoctor,
    getStatistics
};