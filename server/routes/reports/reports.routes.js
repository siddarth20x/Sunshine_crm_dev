const express = require("express");
const router = express.Router();
const auth = require("../../middleware/jwt");

const reportController = require("../../controller/reports/reports.controller");

router.get(
  "/get/daily-reports",
  auth.verifyToken,
  reportController.generateDailyReportForAgents
);
router.get(
  "/get/contacted-non-contacted-reports",
  auth.verifyToken,
  reportController.generateContactedNCReports
);

module.exports = router;
