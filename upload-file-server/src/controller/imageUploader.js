const admin = require("../../config/firebase");
// const delay = require("delay");
const bucket = admin.storage().bucket();
// console.log('bucket--', bucket);
const BASE_DIR = process.env.FB_STORAGE_BUCKET_BASE_DIR;
// Upload Files
exports.uploadImages = async (req, res) => {
  const files = req.files;
  const data = [];
  console.log("file-controller---", files);
  try {
    for (let i = 0; i < files.length; i++) {
      const options = {
        destination: BASE_DIR + files[i].filename,
        public: true,
      };
      await new Promise((resolve, reject) => {
        bucket.upload(files[i].path, options, (err, resp) => {
          if (err) {
            // console.log('err', err)
            reject(err);
          } else {
            console.log("----->", resp.metadata);
            data.push(resp.metadata);
            resolve();
          }
        });
      });
      // await delay(2000);
    }
    return res.json({ errorCode: 0, msg: "Image uploaded", files: data });
  } catch (error) {
    console.log("upload-error--", error);
    return res.json({ errorCode: 1, msg: "Image not uploaded", data: error });
  }
};

//GET Files
exports.getImages = async (req, res) => {
  try {
    // Get a list of files in the specified bucket and directory
    const [files] = await bucket.getFiles({ prefix: CATEGORY_ICONS });
    console.log(files, "files-----");
    // Extract the filenames and other metadata from the list of files
    const imageFiles = files.map((file) => ({
      filename: file.name,
      metadata: file.metadata,
    }));

    // Send the list of image files in the response
    return res.json({
      errorCode: 0,
      msg: "Images retrieved successfully",
      files: imageFiles,
    });
  } catch (error) {
    console.error("get error-----", error);
    return res
      .status(500)
      .json({ errorCode: 1, msg: "Image not able to get", data: error });
  }
};
