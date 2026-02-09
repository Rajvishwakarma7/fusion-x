import { Router } from "express";
import { stripeController as StripeController } from "./stripe.controller";
import { authCheck } from "../../middleware/jwt-token.middleware";
import { UserRoles } from "../../utils/Enums.utils";

const router = Router()

router.route('/list-plans').get(authCheck([UserRoles.USER]),StripeController.listPlans);

router.route("/create-checkout-session-subscription").post( authCheck([UserRoles.USER]), StripeController.createCheckoutSessionSubscription)

router.route("/create-checkout-session-one-time").post( authCheck([UserRoles.USER]), StripeController.createCheckoutSessionOneTime)

router.route('/cancel-subscription').post(authCheck([UserRoles.USER]), StripeController.cancelSubscription);

router.route('/upgrade-subscription').post(authCheck([UserRoles.USER]), StripeController.upgradeSubscription);

router.route('/user-transactions-history').get(authCheck([UserRoles.USER]), StripeController.userTransactionsHistory);

router.route('/get-user-membership').get(authCheck([UserRoles.USER]), StripeController.getUserMembership);



// connect account  ( organization )
router.route("/connect").get( authCheck([UserRoles.ORGANIZATION]), StripeController.connectStripe)
// check connected account status (charges_enabled / payouts_enabled / details_submitted)
router.route("/connected-account/status").get( authCheck([UserRoles.ORGANIZATION]), StripeController.connectedAccountStatus)

export default router;