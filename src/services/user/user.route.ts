import { Router } from "express";
import { userController as UserController } from "./user.controller";
import { authCheck } from "../../middleware/jwt-token.middleware";

const router = Router()
router.route("/signup").post(UserController.signupUser)
router.route("/signin").post(UserController.signinUser)
router.route('/get-me').get(authCheck(['user','seller','admin']),UserController.getMe)


export default router;