import { Router } from "express";
import userRouter from "./user/user.route.js";
import stripeRouter from "./stripe/stripe.route.js"
import organizationRouter from "./organization/organization.route.js"
import teamRouter from "./team/team.route.js"


const router = Router()
router.use("/user", userRouter)
router.use("/stripe", stripeRouter)
router.use("/organization", organizationRouter)
router.use("/team", teamRouter)


export default router;