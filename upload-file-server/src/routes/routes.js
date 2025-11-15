var express = require("express");
const router = express.Router();
const upload = require("../../helpers/upload");

var imageUploader = require("../controller/imageUploader");

//! FILE UPLOAD ROUTES BELOW
// router.post("/image/upload", auth.verifyToken, upload.array("files", 5), imageUploader.uploadImages);
router.post(
  "/image/upload",
  upload.array("files", 5),
  imageUploader.uploadImages
);
router.get("/images/get", imageUploader.getImages);

module.exports = router;
