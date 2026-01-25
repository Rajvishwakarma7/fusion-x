import { Router } from "express";
import { adminController as AdminController } from "./admin.controller";
import { authCheck } from "../../middleware/jwt-token.middleware";
import { UserRoles } from "../../utils/Enums.utils";

const router = Router()

// if webhook not update the connected account info properly then use this route to sync the data
router.route("/stripe/connect/sync").get( authCheck([UserRoles.ADMIN]), AdminController.syncStripeConnectAccount)


export default router;