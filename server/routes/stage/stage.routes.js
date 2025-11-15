const express = require("express");
const router = express.Router();
const auth = require("../../middleware/jwt");
const csv = require("../../middleware/read-validate-csv");
const stageController = require("../../controller/stage/stage.controller");
const multer = require('multer');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    fieldSize: 10 * 1024 * 1024 // 10MB limit for fields
  },
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Process CSV file route
router.post("/process-csv-file", auth.verifyToken, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        errorCode: 1,
        message: 'No file uploaded or invalid file type'
      });
    }
    await csv.processCSV(req, res);
  } catch (error) {
    console.error('Process CSV error:', error);
    res.status(500).json({
      errorCode: 1,
      message: 'Error processing CSV file: ' + error.message
    });
  }
});

// Validate CSV file route
router.post("/validate-csv-file", auth.verifyToken, async (req, res) => {
  try {
    await csv.validateCSV(req, res);
  } catch (error) {
    console.error('Validate CSV error:', error);
    res.status(500).json({
      errorCode: 1,
      message: 'Error validating CSV file: ' + error.message
    });
  }
});

// Upload leads route
router.post("/upload-leads", auth.verifyToken, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        errorCode: 1,
        message: 'No file uploaded or invalid file type'
      });
    }
    await stageController.uploadLeadStageFromCSV(req, res);
  } catch (error) {
    console.error('Upload leads error:', error);
    res.status(500).json({
      errorCode: 1,
      message: 'Error uploading leads: ' + error.message
    });
  }
});

// Transfer leads to main table route
router.get("/leads-upload-to-main", auth.verifyToken, async (req, res) => {
  try {
    await stageController.uploadLeadsFromStageToMainTable(req, res);
  } catch (error) {
    console.error('Transfer leads error:', error);
    res.status(500).json({
      errorCode: 1,
      message: 'Error transferring leads: ' + error.message
    });
  }
});

// Get failed records route
router.get("/get-failed-records", auth.verifyToken, async (req, res) => {
  try {
    await stageController.getFailedRecords(req, res);
  } catch (error) {
    console.error('Get failed records error:', error);
    res.status(500).json({
      errorCode: 1,
      message: 'Error getting failed records: ' + error.message
    });
  }
});

router.get("/getFailedEntriesCount",auth.verifyToken,stageController.getFailedEntryCountsInStage)

module.exports = router;