import { Router } from "express";
import { stripeController as StripeController } from "./stripe.controller";
import { authCheck } from "../../middleware/jwt-token.middleware";
import { UserRoles } from "../../utils/Enums.utils";

const router = Router()
router.route("/connect").get( authCheck([UserRoles.SELLER]), StripeController.connectStripe)
router.route("/create-checkout-session").get( authCheck([UserRoles.SELLER]), StripeController.createCheckoutSessionUrl)


// check connected account status (charges_enabled / payouts_enabled / details_submitted)
router.route("/connected-account/status").get( authCheck([UserRoles.SELLER]), StripeController.connectedAccountStatus)

export default router;