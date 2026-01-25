import { Router } from "express";
import express from "express";
import { stripeWebhookConnect, stripeWebhookPlatform  } from "./webhook.provider.js";

const router = Router();
router.post('/web-hook/platform', express.raw({type: 'application/json'}), stripeWebhookPlatform );
router.post('/web-hook/connect', express.raw({type: 'application/json'}), stripeWebhookConnect );



export default router;
