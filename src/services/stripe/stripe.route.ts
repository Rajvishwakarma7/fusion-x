import { Router } from "express";
import { stripeController as StripeController } from "./stripe.controller";
import { authCheck } from "../../middleware/jwt-token.middleware";
import { UserRoles } from "../../utils/Enums.utils";

const router = Router()

router.route('/list-plans').get(StripeController.listPlans);
router.route("/create-checkout-session").get( authCheck([UserRoles.USER]), StripeController.createCheckoutSession)
router.route('/cancel-subscription').post(authCheck([UserRoles.USER]), StripeController.cancelSubscription);
router.route('/upgrade-subscription').post(authCheck([UserRoles.USER]), StripeController.upgradeSubscription);
router.route('/user-transactions-history').get(authCheck([UserRoles.USER]), StripeController.userTransactionsHistory);
router.route('/get-user-membership').get(authCheck([UserRoles.USER]), StripeController.getUserMembership);

// connect account 
router.route("/connect").get( authCheck([UserRoles.SELLER]), StripeController.connectStripe)
// check connected account status (charges_enabled / payouts_enabled / details_submitted)
router.route("/connected-account/status").get( authCheck([UserRoles.SELLER]), StripeController.connectedAccountStatus)

export default router;