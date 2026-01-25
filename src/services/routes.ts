import { Router } from "express";
import userRouter from "./user/user.route.js";
import stripeRouter from "./stripe/stripe.route.js"

const router = Router()
router.use("/user", userRouter)
router.use("/stripe", stripeRouter)

export default router;