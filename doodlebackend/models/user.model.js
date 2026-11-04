const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase:true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select:false
    },
    isActive:{
        type:Boolean,
        default:true
    },
    // Default shipping address — prefilled into orders at checkout.
    address: {
        line1: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        country: { type: String, trim: true, default: "USA" },
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
},
{
    timestamps:true,
});

const User=mongoose.model("User", userSchema)
module.exports = User;
