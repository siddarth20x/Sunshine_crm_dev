const multer = require("multer");
const uniqid = require("uniqid");
const path = require("path");

const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //     cb(null, 'uploads/')
  // },
  filename: (req, file, cb) => {
      console.log("file-upload-req------", req);
    //console.log("file-upload.js------", file);
    cb(
      null,
      "sun-" +
        Date.now() +
        "-" +
        file.originalname.split(".").slice(0, -1).join(".") +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

module.exports = upload;
