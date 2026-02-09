import { Router } from "express";
import { teamController as TeamController } from "./team.controller";
import { authCheck } from "../../middleware/jwt-token.middleware";
import { UserRoles } from "../../utils/Enums.utils";

const router = Router()

router.use(authCheck([UserRoles.ORGANIZATION]));

router.route('/create-team').post(authCheck([UserRoles.USER]),TeamController.createTeam);

export default router;