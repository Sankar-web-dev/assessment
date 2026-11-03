const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require("./config/db");
const User = require("./models/user.model");
const bcrypt = require("bcrypt");

// Fixed admin account — provisioned on startup, no signup endpoint for admins.
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "12345678910";

async function ensureAdminUser() {
    try {
        // select("+password") — schema hides it; also the doc may predate
        // this app and use different field names (e.g. passwordHash).
        const existing = await User.findOne({ email: ADMIN_EMAIL }).select("+password");
        if (existing) {
            let changed = false;
            if (existing.role !== "admin") {
                existing.role = "admin";
                changed = true;
            }
            if (!existing.password) {
                existing.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
                changed = true;
            }
            if (changed) {
                await existing.save();
                console.log("Admin user repaired:", ADMIN_EMAIL);
            }
            return;
        }
        const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await User.create({
            name: "Admin",
            email: ADMIN_EMAIL,
            password,
            role: "admin",
        });
        console.log("Admin user provisioned:", ADMIN_EMAIL);
    } catch (err) {
        console.error("Failed to provision admin user:", err.message);
    }
}

const app=express();
app.use(cors());
const userRoutes = require("./routes/user.routers");
const categoryRoutes = require("./routes/category.routers");
const productRoutes = require("./routes/product.routers");
const orderRoutes = require("./routes/order.routers");
const couponRoutes = require("./routes/coupon.routers");
const reviewRoutes = require("./routes/review.routers");


app.use(express.json());
app.use("/api/v1", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/reviews", reviewRoutes);



app.get('/',(req,res)=>
{
    
    res.status(200).json({message:"Api is running"});
})


const PORT = process.env.PORT || 3000;

connectDB().then(async () => {
await ensureAdminUser();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
});
}).catch(err => {
    console.error("Failed to start the server due to db connection error",err.message);
    process.exit(1);
    
});

