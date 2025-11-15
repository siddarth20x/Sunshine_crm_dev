const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //     cb(null, 'uploads/')
  // },
  filename: (req, file, cb) => {
    // console.log('file-upload.js------', file);
    cb(
      null,
      "sunshine-" +
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
