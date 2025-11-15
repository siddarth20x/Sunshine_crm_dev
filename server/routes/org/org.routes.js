const express = require("express");
const router = express.Router();
const auth = require("../../middleware/jwt");

const orgController = require("../../controller/org/org.controller");
const orgCompanyController = require("../../controller/org/org.companyController");
const orgContactController = require("../../controller/org/org.contactController");
const orgLocationController = require("../../controller/org/org.locationController");

//Company
router.get(
  "/get/allCompany",
  auth.verifyToken,
  orgCompanyController.getAllCompany
);
router.get("/get/company", auth.verifyToken, orgCompanyController.getCompany);
router.get(
  "/get/companyType",
  auth.verifyToken,
  orgCompanyController.getAllCompanyType
);
router.post(
  "/post/company",
  auth.verifyToken,
  orgCompanyController.createOrgCompany
);
router.put(
  "/put/company",
  auth.verifyToken,
  orgCompanyController.editOrgCompany
);
// router.get('/get/contact',orgController.getContact);

//Contact

router.get(
  "/get/contactDeptType",
  auth.verifyToken,
  orgContactController.getAllContactDeptType
);
router.get(
  "/get/contactById",
  auth.verifyToken,
  orgContactController.getContactById
);
router.post(
  "/post/contact",
  auth.verifyToken,
  orgContactController.createOrgContact
);
router.put(
  "/put/contact",
  auth.verifyToken,
  orgContactController.editOrgContact
);

//Location
router.get(
  "/get/locationType",
  auth.verifyToken,
  orgLocationController.getAllLocationType
);
router.get(
  "/get/locationById",
  auth.verifyToken,
  orgLocationController.getLocationById
);
router.get(
  "/get/addressType",
  auth.verifyToken,
  orgLocationController.getAllAddressType
);
router.post(
  "/post/location",
  auth.verifyToken,
  orgLocationController.createOrgLocation
);
router.put(
  "/put/location",
  auth.verifyToken,
  orgLocationController.editOrgLocation
);

module.exports = router;
