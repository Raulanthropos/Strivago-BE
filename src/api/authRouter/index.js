import express from "express";
import { generateJwt } from "../../lib/auth/jwtAuth.js";
import UsersModel from "../user/model.js";

const authRouter = express.Router()

authRouter.post("/login", async (req, res, next) => {
try {
    const {email, password} = req.body;
    if(!email || !password) {
        throw new Error("Please provide both email and password");
    } else {
        const user = await UsersModel.checkCredentials(email, password)
        console.log("This is the user", user)
        if(!user) {
            throw new Error("Invalid email or password");
        }
        const token = await generateJwt({id: user._id});
        res.status(200).send({token});
    }
    
} catch (error) {
    next(error);
}
})

export default authRouter;