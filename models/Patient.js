
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Patient name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: [254, "Email cannot exceed 254 characters"],
            validate: {
                validator: function (value) {
                    return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                message: "Please provide a valid email address"
            }
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            maxlength: [20, "Phone number cannot exceed 20 characters"],
            match: [
                /^[+]?[0-9\s().-]{7,20}$/,
                "Please provide a valid phone number"
            ]
        },

        age: {
            type: Number,
            required: [true, "Patient age is required"],
            min: [0, "Age cannot be negative"],
            max: [120, "Please provide a valid age"]
        },

        gender: {
            type: String,
            required: [true, "Gender is required"],
            enum: {
                values: ["male", "female", "other"],
                message: "Gender must be male, female, or other"
            },
            lowercase: true,
            trim: true
        },

        condition: {
            type: String,
            required: [true, "Medical condition is required"],
            trim: true,
            maxlength: [150, "Condition cannot exceed 150 characters"]
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            default: null
        },

        address: {
            type: String,
            trim: true,
            maxlength: [300, "Address cannot exceed 300 characters"],
            default: ""
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [2000, "Notes cannot exceed 2000 characters"],
            default: ""
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

patientSchema.index({ doctor: 1, createdAt: -1 });
patientSchema.index({ condition: 1, createdAt: -1 });
patientSchema.index({ createdAt: -1 });

patientSchema.index({ name: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 });

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
