const User = require("../models/user.model")
const bcrypt = require("bcrypt")
const tokenService = require("../jwt/token.service");

class UserService
{
    async signup(name,email,password)
    {
        const existingUser = await User.findOne({email});
        if(existingUser)
        {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({name,email,password:hashedPassword});
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        return userWithoutPassword;
    }

    async login(email,password)
    {
        const user = await User.findOne({email}).select("+password");
        if(!user)
        {
            throw new Error("User not found");
        }
        if(!user.isActive)
        {   
            throw new Error("Your account is inactive. Please contact support.");
        }
        const isPasswordValid =
            user.password && (await bcrypt.compare(password, user.password));
        if(!isPasswordValid)
        {
            throw new Error("Invalid password");
        }
        const payload = { id: user._id, email: user.email, isActive: user.isActive, role: user.role };
        const token = tokenService.generateToken(payload);
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        return { user:userWithoutPassword, token };
    }

    // Admin-only: all registered users (password is excluded by the schema).
    async getAllUsers()
    {
        return User.find().sort({ createdAt: -1 });
    }

    // Admin-only: activate/deactivate a user account.
    async setUserStatus(id, isActive)
    {
        const user = await User.findByIdAndUpdate(
            id,
            { $set: { isActive: Boolean(isActive) } },
            { new: true }
        );
        if(!user)
        {
            throw new Error("User not found");
        }
        return user;
    }

    async logout()
    {
        return { message: "Logout successful" };
    }
}

module.exports = new UserService();