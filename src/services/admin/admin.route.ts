import { Router } from "express";
import { adminController as AdminController } from "./admin.controller";
import { authCheck } from "../../middleware/jwt-token.middleware";
import { UserRoles } from "../../utils/Enums.utils";

const router = Router()
router.use(authCheck([UserRoles.ADMIN]));
// if webhook not update the connected account info properly then use this route to sync the data
router.route("/stripe/connect/sync").get(  AdminController.syncStripeConnectAccount)


export default router;