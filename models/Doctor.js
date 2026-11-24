
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Doctor name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        specialization: {
            type: String,
            required: [true, "Specialization is required"],
            trim: true,
            maxlength: [100, "Specialization cannot exceed 100 characters"]
        },

        hospital: {
            type: String,
            required: [true, "Hospital name is required"],
            trim: true,
            maxlength: [150, "Hospital name cannot exceed 150 characters"]
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            maxlength: [20, "Phone number cannot exceed 20 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [254, "Email cannot exceed 254 characters"]
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

doctorSchema.index({ name: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ hospital: 1 });
doctorSchema.index({ createdAt: -1 });

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
