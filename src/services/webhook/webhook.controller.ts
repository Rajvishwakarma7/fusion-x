// import { NextFunction, Request, Response } from "express";
// import * as UserProvider from "./webhook.provider.js";
// import { TGenResObj } from "../../utils/commonInterface.util.js";

// export const webhookController = {
//     webhook: async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const { body } = req;
//         const { code, data }: TGenResObj = await UserProvider.stripeWebhook(
//           body
//         );
//         res.status(code).json(data);
//         return;
//       } catch (error) {
//         next(error);
//       }
//     },
// };
