const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt");
const emailController = require("../controller/email-service");

router.post("/email", auth.verifyToken, emailController.sendEmail);
router.post("/forgot-pwd-email", emailController.sendEmail);

module.exports = router;
