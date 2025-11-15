const express = require('express');
const router = express.Router();
const multer = require('multer');
const admin = require('firebase-admin');
const accountController = require('../../controller/account/account.controller');
const commonController = require('../../helpers/common');

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
  const serviceAccount = {
    type: process.env.FB_TYPE,
    project_id: process.env.FB_PROJECT_ID,
    private_key_id: process.env.FB_PRIVATE_KEY_ID,
    private_key: process.env.FB_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FB_CLIENT_EMAIL,
    client_id: process.env.FB_CLIENT_ID,
    auth_uri: process.env.FB_AUTH_URI,
    token_uri: process.env.FB_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FB_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FB_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FB_UNIVERSE_DOMAIN
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FB_STORAGE_BUCKET
  });
}

const bucket = admin.storage().bucket();

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

// Helper function to get user name
const getUserNameById = async (userId) => {
  try {
    const query = `SELECT CONCAT(first_name, " ", last_name) as user_name FROM user.user WHERE user_id = ?`;
    const result = await commonController.executeQuery(query, [userId]);
    return result.rows[0]?.user_name || 'unknown';
  } catch (error) {
    console.error('Error getting user name:', error);
    return 'unknown';
  }
};

// Helper function to get bank name
const getBankNameById = async (companyId) => {
  try {
    const query = `SELECT company_name FROM org.company WHERE company_id = ?`;
    const result = await commonController.executeQuery(query, [companyId]);
    return result.rows[0]?.company_name || 'Unknown Bank';
  } catch (error) {
    console.error('Error getting bank name:', error);
    return 'Unknown Bank';
  }
};

// Upload file route
router.post('/upload', upload.single('csvFile'), async (req, res) => {
  try {
    console.log('Received upload request:', {
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file',
      body: req.body
    });

    if (!req.file) {
      return res.status(400).json({ 
        errorCode: 1,
        message: 'No file uploaded or invalid file type' 
      });
    }

    // Destructure only what's needed from req.body for this part.
    // req.body.file_name is sent by the client, but for the actual file storage,
    // we will use req.file.originalname provided by multer.
    const { app_user_id, file_type, company_id } = req.body; 
    
    // Ensure critical data from multer (req.file) and body is present
    if (!company_id || !app_user_id || !req.file || !req.file.originalname) {
      return res.status(400).json({
        errorCode: 1,
        message: 'Missing required fields (app_user_id, company_id) or critical file information (file or originalname).'
      });
    }

    // Upload to Firebase Storage
    // Use the originalname from multer's req.file object for storage
    const serverSideFileName = req.file.originalname;
    // NOTE: It is highly recommended to sanitize 'serverSideFileName' before using it.
    // This helps prevent path traversal attacks and issues with invalid characters.
    // Example (simple sanitization):
    // const sanitizedFileName = serverSideFileName.replace(/[^\w.-]/g, '_');
    // For this change, we'll use the original name directly as requested.
    // Consider implementing robust sanitization based on your security requirements.

    const filePath = `files/csvfiles/${serverSideFileName}`; 
    const file = bucket.file(filePath);
    
    try {
      // Upload file to Firebase
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype
        }
      });

      // Get the public URL
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Long expiration
      });

      // Store file metadata in database
      console.log('Calling uploadFile with params:', {
        app_user_id,
        file_type: file_type || 'csv',
        file_name: serverSideFileName,
        file_url: url,
        company_id
      });
      
      const result = await accountController.uploadFile({
        app_user_id,
        file_type: file_type || 'csv',
        file_name: serverSideFileName, // Changed to use the original filename
        file_url: url,
        company_id
      });

      console.log('Upload result:', result);

      // Always return success if we got here (file is in Firebase)
      res.status(200).json(result);
    } catch (error) {
      // If any error occurs, try to delete the file from Firebase
      try {
        await file.delete();
      } catch (deleteError) {
        console.error('Error deleting file from Firebase:', deleteError);
      }

      console.error('Upload error:', error);
      res.status(500).json({
        errorCode: 1,
        message: error.message || 'Error uploading file'
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      errorCode: 1,
      message: error.message || 'Error uploading file'
    });
  }
});

// Get all uploaded files with filters
router.get('/files', async (req, res) => {
  try {
    const { app_user_id, file_upload_id, file_name, file_url, company_id, start_dtm, end_dtm } = req.query;
    
    // Use stored procedure to get files
    const query = `CALL stage.get_file_upload(@err, ?, ?, ?, ?, ?, ?, ?)`;
    const args = [app_user_id, file_upload_id, file_name, file_url, company_id, start_dtm, end_dtm];
    
    const { rows } = await commonController.executeQuery(query, args);
    
    res.status(200).json({
      errorCode: 0,
      message: "Files retrieved successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ 
      errorCode: 1,
      message: 'Error retrieving files: ' + error.message 
    });
  }
});

// Download file
router.get('/download/:fileName', async (req, res) => {
  try {
    const fileName = `files/csvfiles/${req.params.fileName}`;
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({ downloadUrl: url });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Error downloading file' });
  }
});

// // Preview file content
// router.get('/preview', async (req, res) => {
//   try {
//     const { fileName } = req.query;
//     if (!fileName) {
//       return res.status(400).json({ error: 'Missing fileName parameter' });
//     }

//     const filePath = `files/csvfiles/${fileName}`;
//     const file = bucket.file(filePath);

//     const [exists] = await file.exists();
//     if (!exists) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     // Download file content
//     const [contents] = await file.download();
//     const csvContent = contents.toString('utf-8');

//     res.set('Content-Type', 'text/plain');
//     res.send(csvContent);
//   } catch (error) {
//     console.error('Preview error:', error);
//     res.status(500).json({ error: 'Error previewing file: ' + error.message });
//   }
// });

// Preview file content from database
router.get('/preview-db', async (req, res) => {
  try {
    const { fileName } = req.query;
    if (!fileName) {
      return res.status(400).json({ error: 'Missing fileName parameter' });
    }
    // Fetch file content from DB
    const result = await commonController.executeQuery('SELECT file_content FROM uploaded_files WHERE file_name = ?', [fileName]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'File not found in database' });
    }
    res.set('Content-Type', 'text/plain');
    res.send(result.rows[0].file_content);
  } catch (error) {
    console.error('Preview DB error:', error);
    res.status(500).json({ error: 'Error previewing file from DB: ' + error.message });
  }
});

module.exports = router; 