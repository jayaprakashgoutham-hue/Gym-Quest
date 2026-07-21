import { Router, type IRouter } from "express";
import healthRouter from "./health";
import importPdfRouter from "./import-pdf";
import importRealmRouter from "./import-realm";

const router: IRouter = Router();

router.use(healthRouter);
router.use(importPdfRouter);
router.use(importRealmRouter);

export default router;
