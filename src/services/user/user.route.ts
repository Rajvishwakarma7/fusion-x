import { Router } from "express";
import { userController as UserController } from "./user.controller";

const router = Router()
router.route("/signup").post(UserController.signupUser)
router.route("/signin").post(UserController.signinUser)


export default router;