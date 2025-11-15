const commonController = require("../../helpers/common");
require("dotenv").config();
const fileUploadURL = process.env.fileUploadServerBaseURL;
const FormData = require("form-data");
const axios = require("axios");
const admin = require("../../config/firebase");
// const delay = require("delay");
const bucket = admin.storage().bucket();
// //console.log('bucket--', bucket);
const BASE_DIR = process.env.FB_STORAGE_BUCKET_BASE_DIR;

const fetchAllLeads = async (req, res) => {
  const {
    app_user_id,
    lead_id,
    company_id,
    lead_status_type_id,
    assigned_by,
    assigned_to,
    account_number,
    product_type,
    product_account_number,
  } = req.query;
  //console.log("get-leads:::::::::::>>>", req.query);
  // const query = `call crm.get_lead (@err,2,null,"PAS", 2, null,null,null,"INFOSYS","2021-08-01","2021-09-01","Maharashtra","UPLOAD MCA INDIAN LEAD","NOT SENT")`;
  const query = `CALL crm.get_lead (@err,?,?,?,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    lead_id,
    company_id,
    lead_status_type_id,
    assigned_by,
    assigned_to,
    account_number,
    product_type,
    product_account_number,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-leads-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Fetched all Leads",
      data: rows,
    });
  } catch (err) {
    console.error("get-leads-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch all leads",
      data: err,
    });
  }
};



const updateLead = async (req, res) => {
  const {
    app_user_id,
    company_id,
    lead_status_type_id,
    template_type_id,
    senior_manager_id,
    team_manager_id,
    assigned_by,
    assigned_dtm,
    assigned_to,
    target_dtm,
    account_number,
    product_type,
    product_account_number,
    agreement_id,
    finware_acn01,
    business_name,
    customer_name,
    allocation_status,
    customer_id,
    passport_number,
    date_of_birth,
    bucket_status,
    card_auth,
    dpd_r,
    due_since_date,
    vintage,
    date_of_woff,
    nationality,
    emirates_id_number,
    employer_details,
    designation,
    company_contact,
    office_address,
    monthly_income,
    friend_residence_phone,
    withdraw_date,
    father_name,
    mother_name,
    spouse_name,
    pli_status,
    execution_status,
    overdue,
    banker_name,
    is_visit_required,
    settlement_status,
    allocation_type,
    fresh_stab,
    cycle_statement,
    dcore_id,
  } = req.body;
  const query = `CALL crm.create_lead (@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@olid)`;
  const args = [
    app_user_id,
    company_id,
    lead_status_type_id,
    template_type_id,
    senior_manager_id,
    team_manager_id,
    assigned_by,
    assigned_dtm,
    assigned_to,
    target_dtm,
    account_number,
    product_type,
    product_account_number,
    agreement_id,
    finware_acn01,
    business_name,
    customer_name,
    allocation_status,
    customer_id,
    passport_number,
    date_of_birth,
    bucket_status,
    card_auth,
    dpd_r,
    due_since_date,
    vintage,
    date_of_woff,
    nationality,
    emirates_id_number,
    employer_details,
    designation,
    company_contact,
    office_address,
    monthly_income,
    friend_residence_phone,
    withdraw_date,
    father_name,
    mother_name,
    spouse_name,
    pli_status,
    execution_status,
    overdue,
    banker_name,
    is_visit_required,
    settlement_status,
    allocation_type,
    fresh_stab,
    cycle_statement,
    dcore_id,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);

    return res.status(200).json({
      errorCode: 0,
      message: "Updated Account Successfully",
      data: rows,
    });
  } catch (err) {
    console.error("put-leads-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to update account details",
      data: err,
    });
  }
};

const getAllDispositionTypes = async (req, res) => {
  const { disposition_code_id } = req.query;
  // const query = `call crm.get_disposition_code (@err,1)`;
  const query = `CALL crm.get_disposition_code (@err,?)`;
  const args = [disposition_code_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("get-disposition-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Fetched disposition code",
      data: rows,
    });
  } catch (err) {
    console.error("get-disposition-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch dispositions",
      data: err,
    });
  }
};

const getAllTaskTypes = async (req, res) => {
  const { task_type_id } = req.query;
  // const query = `call crm.get_task_type (@err,null)`;
  const query = `CALL crm.get_task_type(@err,?)`;
  const args = [task_type_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("get_task_type-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Fetched Task Types",
      data: rows,
    });
  } catch (err) {
    console.error("get_task_type-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch task types",
      data: err,
    });
  }
};

const getAllTaskStatusTypes = async (req, res) => {
  const { task_status_type_id } = req.query;
  // const query = `call crm.get_task_status_type (@err,null)`;
  const query = `CALL crm.get_task_status_type(@err,?)`;
  const args = [task_status_type_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // //console.log("get_task_status_type-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Fetched Task Status Types",
      data: rows,
    });
  } catch (err) {
    // //console.log("get_task_status_type-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch task status types",
      data: err,
    });
  }
};

const createNewTask = async (req, res) => {
  //console.log("create-task-payload:::", req.body);
  const {
    app_user_id,
    task_type_id,
    disposition_code_id,
    lead_id,
    assigned_by,
    assigned_dtm,
    assigned_to,
    target_dtm,
    task_status_type_id,
    document_url,
    mode_of_contact,
  } = req.body;
  // const query = `call crm.create_task (@err,null)`;
  const query = `CALL crm.create_task(@err,?,?,?,?,?,?,?,?,?,?,?,@onid)`;
  const args = [
    app_user_id,
    task_type_id,
    disposition_code_id,
    lead_id,
    assigned_by,
    assigned_dtm,
    assigned_to,
    target_dtm,
    task_status_type_id,
    document_url,
    mode_of_contact,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("post-new-task-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Created Task",
      data: rows,
    });
  } catch (err) {
    console.error("post-new-task-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to create task",
      data: err,
    });
  }
};

const fetchAllTasks = async (req, res) => {
  const {
    app_user_id,
    task_id,
    task_type_id,
    disposition_code_id,
    task_status_type_id,
    lead_id,
    company_id,
    status // Adding the missing parameter
  } = req.query;
  const query = `CALL crm.get_task(@err,?,?,?,?,?,?,?,?)`; // Now passing 8 parameters
  const args = [
    app_user_id,
    task_id,
    task_type_id,
    disposition_code_id,
    task_status_type_id,
    lead_id,
    company_id,
    status || null // Default to null if not provided
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    return res.status(200).json({
      errorCode: 0,
      message: "Fetched All Tasks",
      data: rows,
    });
  } catch (err) {
    console.error("get_tasks-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch all tasks",
      data: err,
    });
  }
};

// const uploadDocuments = async (req, res) => {
//   try {
//     const files = req.files;
//     const token = req.headers.authorization;

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         errorCode: 1,
//         msg: "No files were uploaded",
//         data: null
//       });
//     }

//     const formData = new FormData();

//     // Append each file in req.files
//     files.forEach(file => {
//       console.log('Uploading to URL:', fileUploadURL);
//       // Create a readable stream from the buffer
//       // const stream = require('stream');
//       const bufferStream = new stream.PassThrough();
//       bufferStream.end(file.buffer);
      
//       formData.append('files', bufferStream, {
//         filename: file.originalname,
//         contentType: file.mimetype
//       });
//     });

//     const response = await axios.post(fileUploadURL, formData, {
//       headers: {
//         ...formData.getHeaders(),
//         Authorization: token,
//       },
//       maxContentLength: Infinity,
//       maxBodyLength: Infinity
//     });

//     return res.json({
//       errorCode: 0,
//       msg: "File uploaded to storage",
//       data: {
//         mediaLink: response.data.mediaLink || response.data.url,
//         files: files.map(file => ({
//           originalname: file.originalname,
//           mimetype: file.mimetype,
//           size: file.size
//         }))
//       }
//     });
//   } catch (error) {
//     console.error("upload-error--", error);
//     return res.status(500).json({
//       errorCode: 1,
//       msg: "Failed to upload file to storage",
//       data: error.message,
//     });
//   }
// };
const uploadDocuments = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        errorCode: 1,
        msg: "No files were uploaded",
        data: null
      });
    }

    const uploadedFiles = [];
    
    for (const file of files) {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `sunshine-${timestamp}-${file.originalname}`;
      const filePath = `${BASE_DIR}/${filename}`;
      
      // Upload to Firebase Storage
      const fileBuffer = file.buffer;
      const fileUpload = bucket.file(filePath);
      
      await fileUpload.save(fileBuffer, {
        metadata: {
          contentType: file.mimetype,
          contentDisposition: `attachment; filename="${file.originalname}"`
        }
      });

      // Get the signed URL with content-disposition header
      const [url] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: '03-01-2500', // Far future expiration
        responseDisposition: `attachment; filename="${file.originalname}"`
      });

      uploadedFiles.push({
        originalname: file.originalname,
        filename: filename,
        mimetype: file.mimetype,
        size: file.size,
        url: url,
        mediaLink: url // Add this to match the client's expectation
      });
    }

    return res.json({
      errorCode: 0,
      msg: "Files uploaded successfully",
      data: {
        files: uploadedFiles
      }
    });
  } catch (error) {
    console.error("upload-error--", error);
    return res.status(500).json({
      errorCode: 1,
      msg: "Failed to upload files",
      data: error.message,
    });
  }
};
const getDocuments = async (req, res) => {
  try {
    // Get a list of files in the specified bucket and directory
    const [files] = await bucket.getFiles({ prefix: BASE_DIR });
    //console.log(files, "files-----");
    // Extract the filenames and other metadata from the list of files
    const imageFiles = files.map((file) => ({
      filename: file.name,
      metadata: file.metadata,
    }));

    // Send the list of image files in the response
    return res.json({
      errorCode: 0,
      msg: "Docs retrieved successfully",
      files: imageFiles,
    });
  } catch (error) {
    console.error("get error-----", error);
    return res
      .status(500)
      .json({ errorCode: 1, msg: "Docs not able to get", data: error });
  }
};

const putTaskByTaskId = async (req, res) => {
  const {
    app_user_id,
    task_id,
    task_type_id,
    disposition_code_id,
    lead_id,
    assigned_by,
    assigned_dtm,
    assigned_to,
    target_dtm,
    task_status_type_id,
    document_url,
    mode_of_contact,
    status,
  } = req.body;

  // Ensure target_dtm is properly formatted to prevent timezone issues
  let formattedTargetDtm = target_dtm;
  if (target_dtm && typeof target_dtm === 'string') {
    // If target_dtm contains time information, extract only the date part
    if (target_dtm.includes('T') || target_dtm.includes(' ')) {
      formattedTargetDtm = target_dtm.split('T')[0].split(' ')[0];
    }
    // Ensure the date is in YYYY-MM-DD format
    const dateParts = formattedTargetDtm.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const day = parseInt(dateParts[2]);
      
      // Validate date components
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        formattedTargetDtm = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  // If target_dtm is empty, null, or undefined, set it to null to prevent database from updating it
  if (!formattedTargetDtm || formattedTargetDtm === '' || formattedTargetDtm === 'null' || formattedTargetDtm === 'undefined') {
    formattedTargetDtm = null;
  }

  console.log('Backend target date debugging:', {
    originalTargetDtm: target_dtm,
    formattedTargetDtm: formattedTargetDtm
  });

  // const query = `call crm.edit_task (@err,null,null,null,null,null,null,null,null,null,null,null,null,)`;
  const query = `CALL crm.edit_task(@err,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    task_id,
    task_type_id,
    disposition_code_id,
    lead_id,
    assigned_by,
    assigned_dtm,
    assigned_to,
    formattedTargetDtm, // Use the formatted date here
    task_status_type_id,
    document_url,
    mode_of_contact,
    status,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("edit_task-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Updated Task Successfully",
      data: rows,
    });
  } catch (err) {
    console.error("edit_task-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to update the task",
      data: err,
    });
  }
};

const fetchAllNotes = async (req, res) => {
  const { note_id, task_id } = req.query;
  // const query = `call crm.get_note (@err,null,null)`;
  const query = `CALL crm.get_note(@err,?,?)`;
  const args = [note_id, task_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("notes-get-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Fetched All Notes",
      data: rows,
    });
  } catch (err) {
    console.error("notes-get-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch all notes",
      data: err,
    });
  }
};

const createNewNotes = async (req, res) => {
  const { app_user_id, task_id, note } = req.body;
  // const query = `call crm.get_note (@err,null,null)`;
  const query = `CALL crm.create_note(@err,?,?,?,@onid)`;
  const args = [app_user_id, task_id, note];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("notes-add-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Added New Note",
      data: rows,
    });
  } catch (err) {
    console.error("notes-add-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to add new note",
      data: err,
    });
  }
};

const getLeadsBySearchParams = async (req, res) => {
  const {
    app_user_id,
    company_id,
    account_number,
    product_account_number,
    agreement_id,
    customer_name,
    customer_id,
    passport_number,
    emirates_id_number,
    state,
  } = req.query;
  
  // Get lead_id_list from request body instead of query parameters
  const { lead_id_list } = req.body || {};
  
  const args = [
    app_user_id,
    company_id,
    account_number,
    product_account_number,
    agreement_id,
    customer_name,
    customer_id,
    passport_number,
    emirates_id_number,
    state,
    lead_id_list,
  ];
  const query = `CALL crm.get_leads_by_search_params(@err,?,?,?,?,?,?,?,?,?,?,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    return res.status(200).json({
      errorCode: 0,
      message: "Account(s) found for applied filter(s)",
      data: rows,
    });
  } catch (err) {
    console.error("get_leads_by_search_params", err);
    return res.status(500).json({
      errorCode: 1,
      message: "No account(s) found for applied filter(s)",
      data: err,
    });
  }
};

const fetchAllCrmUserLogActivity = async (req, res) => {
  const { lead_id, start_dtm, end_dtm } = req.query;
  const args = [lead_id, start_dtm, end_dtm];
  const query = `CALL crm.get_activity_log(@err,?,?,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("crm.get_activity_log::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully retrived activity logs",
      data: rows,
    });
  } catch (err) {
    console.error("crm.get_activity_log-err:::", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch all activity logs",
      data: err,
    });
  }
};

const updateNotes = async (req, res) => {
  //console.log(req);
  const { app_user_id, note_id, note, status } = req.query;
  // const query = `call crm.edit_note (@err,null,null,null,null)`;
  const query = `CALL crm.edit_note(@err,?,?,?,?)`;
  const args = [app_user_id, note_id, note, status];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("edit_note-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Updated Note Successfully",
      data: rows,
    });
  } catch (err) {
    console.error("edit_note-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to update note",
      data: err,
    });
  }
};

const getAllLeadStatusTypes = async (req, res) => {
  const { lead_status_type_id } = req.query;
  // const query = `call crm.get_task_status_type (@err,null)`;
  const query = `CALL crm.get_lead_status_type(@err,?)`;
  const args = [lead_status_type_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // //console.log("get_task_status_type-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Fetched All Lead Status Types",
      data: rows,
    });
  } catch (err) {
    // //console.log("get_task_status_type-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch lead status types",
      data: err,
    });
  }
};

const getDispositionCode = async (req, res) => {
  const { disposition_code_id } = req.query;
  const args = [disposition_code_id];
  const query = `CALL crm.get_disposition_code (@err,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("getDispositionCode", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched disposition code",
      data: rows,
    });
  } catch (err) {
    // console.error("getDispositionCode-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch disposition code",
      data: err,
    });
  }
};

const createDispositionCode = async (req, res) => {
  const {
    app_user_id,
    stage,
    stage_status,
    stage_status_name,
    stage_status_code,
  } = req.body;
  const args = [
    app_user_id,
    stage,
    stage_status,
    stage_status_name,
    stage_status_code,
  ];
  const query = `CALL crm.create_disposition_code (@err,?,?,?,?,?,@onid)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("createDispositionCode-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully created disposition code",
      data: rows,
    });
  } catch (err) {
    console.error("createDispositionCode-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to create disposition code",
      data: err,
    });
  }
};

const editDispositionCode = async (req, res) => {
  const {
    app_user_id,
    disposition_code_id,
    stage,
    stage_status,
    stage_status_name,
    stage_status_code,
    status,
  } = req.body;
  const args = [
    app_user_id,
    disposition_code_id,
    stage,
    stage_status,
    stage_status_name,
    stage_status_code,
    status,
  ];
  const query = `CALL crm.edit_disposition_code (@err,?,?,?,?,?,?,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("editDispositionCode-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Your changes have been successfully saved.",
      data: rows,
    });
  } catch (err) {
    console.error("editDispositionCode-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to save.",
      data: err,
    });
  }
};

const getDashboardCounts = async (req, res) => {
  const { app_user_id, company_id, start_dtm, end_dtm } = req.query;

  const query = `CALL crm.get_lead_stats (@err,?,?,?,?)`;
  const args = [app_user_id, company_id, start_dtm, end_dtm];
  
  try {
    const { rows } = await commonController.executeQuery(query, args);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched dashboard counts",
      data: rows,
    });
  } catch (err) {
    console.error("dashboard_counts-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch dashboard counts",
      data: err,
    });
  }
};

const getTargetStats = async (req, res) => {
  const { app_user_id, in_start_dtm, in_end_dtm } = req.query;
  const query = `CALL crm.get_target_stats (@err,?,?,?)`;
  const args = [app_user_id, in_start_dtm, in_end_dtm];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // //console.log("getTargetStats::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched target counts",
      data: rows,
    });
  } catch (err) {
    console.error("getTargetStats-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch target counts",
      data: err,
    });
  }
};

const getSQParameterType = async (req, res) => {
  const { sq_parameter_type_id } = req.query;
  const query = `CALL crm.get_sq_parameter_type (@err,?)`;
  const args = [sq_parameter_type_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get_sq_parameter_type::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched SQ Params Type",
      data: rows,
    });
  } catch (err) {
    console.error("get_sq_parameter_type-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch SQ Params Type",
      data: err,
    });
  }
};

const createSQCheckScores = async (req, res) => {
  const {
    app_user_id,
    lead_id,
    task_id,
    sq_parameter_type_id,
    scoring1_status,
    scoring1,
    scoring2_status,
    scoring2,
    scoring3_status,
    scoring3,
  } = req.body;
  const query = `CALL crm.create_sq_check (@err,?,?,?,?,?,?,?,?,?,?,@osqchkid)`;
  const args = [
    app_user_id,
    lead_id,
    task_id,
    sq_parameter_type_id,
    scoring1_status,
    scoring1,
    scoring2_status,
    scoring2,
    scoring3_status,
    scoring3,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("create_sq_check-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully saved SQ Check Scores",
      data: rows,
    });
  } catch (err) {
    console.error("create_sq_check-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to save SQ Check Scores",
      data: err,
    });
  }
};

const fetchSQCheckScores = async (req, res) => {
  const { sq_check_id, lead_id, sq_parameter_type_id } = req.query;
  const query = `CALL crm.get_sq_check (@err,?,?,?)`;
  const args = [sq_check_id, lead_id, sq_parameter_type_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("get_sq_check-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched SQ Check Scores",
      data: rows,
    });
  } catch (err) {
    console.error("get_sq_check-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch SQ Check Scores",
      data: err,
    });
  }
};

const createNewPaymentLedgerEntry = async (req, res) => {
  {
    const {
      app_user_id,
      lead_id,
      task_id,
      last_paid_amount,
      last_paid_date,
      credit_limit,
      principal_outstanding_amount,
      total_outstanding_amount,
      minimum_payment,
      ghrc_offer_1,
      ghrc_offer_2,
      ghrc_offer_3,
      fresh_stab,
      cycle_statement,
      card_auth,
      dpd_r,
      mindue_manual,
      rb_amount,
      overdue_amount,
      due_since_date,
      last_month_paid_unpaid,
      last_usage_date,
      dpd_string,
    } = req.body;
    const query = `CALL crm.create_leads_payment_ledger (@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@olplid)`;
    const args = [
      app_user_id,
      lead_id,
      task_id,
      last_paid_amount,
      last_paid_date,
      credit_limit,
      principal_outstanding_amount,
      total_outstanding_amount,
      minimum_payment,
      ghrc_offer_1,
      ghrc_offer_2,
      ghrc_offer_3,
      fresh_stab,
      cycle_statement,
      card_auth,
      dpd_r,
      mindue_manual,
      rb_amount,
      overdue_amount,
      due_since_date,
      last_month_paid_unpaid,
      last_usage_date,
      dpd_string,
    ];
    try {
      const { rows } = await commonController.executeQuery(query, args);
      ////console.log("create_sq_check-res", rows);
      return res.status(200).json({
        errorCode: 0,
        message: "Successfully created entry into payment ledger",
        data: rows,
      });
    } catch (err) {
      console.error("create_sq_check-err", err);
      return res.status(500).json({
        errorCode: 1,
        message: "Failed to save payment ledger entry",
        data: err,
      });
    }
  }
};

const getAllLeadsPaymentLedgerEntry = async (req, res) => {
  const { lead_id } = req.query;
  const query = `CALL crm.get_leads_payment_ledger (@err,?)`;
  const args = [lead_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("getAllLeadsPaymentLedgerEntry-res::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched leads payment ledger",
      data: rows,
    });
  } catch (err) {
    console.error("getAllLeadsPaymentLedgerEntry-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch leads payment ledger entries",
      data: err,
    });
  }
};

const editPaymentLedgerEntry = async (req, res) => {
  const {
    lead_payment_ledger_id,
    app_user_id,
    lead_id,
    task_id,
    last_paid_amount,
    last_paid_date,
    credit_limit,
    principal_outstanding_amount,
    total_outstanding_amount,
    minimum_payment,
    ghrc_offer_1,
    ghrc_offer_2,
    ghrc_offer_3,
    fresh_stab,
    cycle_statement,
    card_auth,
    dpd_r,
    mindue_manual,
    rb_amount,
    overdue_amount,
    due_since_date,
    last_month_paid_unpaid,
    last_usage_date,
    dpd_string,
    status,
  } = req.body;
  const query = `CALL crm.edit_leads_payment_ledger (@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const args = [
    lead_payment_ledger_id,
    app_user_id,
    lead_id,
    task_id,
    last_paid_amount,
    last_paid_date,
    credit_limit,
    principal_outstanding_amount,
    total_outstanding_amount,
    minimum_payment,
    ghrc_offer_1,
    ghrc_offer_2,
    ghrc_offer_3,
    fresh_stab,
    cycle_statement,
    card_auth,
    dpd_r,
    mindue_manual,
    rb_amount,
    overdue_amount,
    due_since_date,
    last_month_paid_unpaid,
    last_usage_date,
    dpd_string,
    status,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("create_sq_check-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully edited payment ledger entry",
      data: rows,
    });
  } catch (err) {
    console.error("create_sq_check-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to edit payment ledger entry",
      data: err,
    });
  }
};

const getAllContactsByLead = async (req, res) => {
  const { lead_id, display_latest } = req.query;
  const query = `CALL crm.get_contacts (@err,?,?)`;
  const args = [lead_id, display_latest];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get_contacts-res::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched contacts",
      data: rows,
    });
  } catch (err) {
    console.error("get_contacts-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch contacts",
      data: err,
    });
  }
};

const postNewContact = async (req, res) => {
  const {
    app_user_id,
    lead_id,
    task_id,
    contact_mode_list,
    customer_name,
    // last_name,
    email,
    phone,
    phone_ext,
    alternate_phone,
    contact_name,
    relationship,
    contact_name_ph_no,
    employment_status,
    employment_type,
    photo,
    is_primary,
    friend_residence_phone,
    monthly_income,
  } = req.body;
  const query = `CALL crm.create_contact (@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@ocid)`;
  const args = [
    app_user_id,
    lead_id,
    task_id,
    contact_mode_list,
    customer_name,
    // last_name,
    email,
    phone,
    phone_ext,
    alternate_phone,
    contact_name,
    relationship,
    contact_name_ph_no,
    employment_status,
    employment_type,
    photo,
    is_primary,
    friend_residence_phone,
    monthly_income,
  ];

  //console.log('query__',req.body, args);

  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("create_sq_check-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully created contact",
      data: rows,
    });
  } catch (err) {
    console.error("create_sq_check-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to save contact",
      data: err,
    });
  }
};

const getAllAddressByLead = async (req, res) => {
  const { lead_id } = req.query;
  const query = `CALL crm.get_address (@err,?)`;
  const args = [lead_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get_address-res::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched address",
      data: rows,
    });
  } catch (err) {
    console.error("get_address-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch address",
      data: err,
    });
  }
};

const postNewAddress = async (req, res) => {
  const {
    app_user_id,
    lead_id,
    task_id,
    contact_mode_list,
    address_name,
    address_line_1,
    address_line_2,
    address_line_3,
    city,
    state,
    country,
    zipcode,
    address_type,
    residence_type,
    living_status,
    photo,
    current_location,
    is_primary,
    office_address,
  } = req.body;
  const query = `CALL crm.create_address (@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@oaid)`;
  const args = [
    app_user_id,
    lead_id,
    task_id,
    contact_mode_list,
    address_name,
    address_line_1,
    address_line_2,
    address_line_3,
    city,
    state,
    country,
    zipcode,
    address_type,
    residence_type,
    living_status,
    photo,
    current_location,
    is_primary,
    office_address,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("create_sq_check-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully created new address",
      data: rows,
    });
  } catch (err) {
    console.error("create_sq_check-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to save new address",
      data: err,
    });
  }
};

const getAllVisaCheckByLead = async (req, res) => {
  const { visa_check_id, lead_id } = req.query;
  const query = `CALL crm.get_visa_check (@err,?,?)`;
  const args = [visa_check_id, lead_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get_visa_check-res::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched visa checks",
      data: rows,
    });
  } catch (err) {
    console.error("get_visa_check-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch visa check",
      data: err,
    });
  }
};

const getAllMOLCheckByLead = async (req, res) => {
  const { mol_check_id, lead_id } = req.query;
  const query = `CALL crm.get_mol_check (@err,?,?)`;
  const args = [mol_check_id, lead_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get_mol_check-res::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched mol checks",
      data: rows,
    });
  } catch (err) {
    console.error("get_mol_check-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch mol check",
      data: err,
    });
  }
};

const postNewVisaCheckByLead = async (req, res) => {
  const {
    app_user_id,
    lead_id,
    task_id,
    contact_mode_list,
    visa_passport_no,
    visa_status,
    visa_expiry_date,
    visa_file_number,
    visa_emirates,
    visa_emirates_id,
    visa_company_name,
    visa_designation,
    visa_contact_no,
    new_emirates_id,
    unified_number,
  } = req.body;

  // Enforce allowed visa statuses
  const allowedVisaStatuses = [
    'ACTIVE',
    'VOILATED',
    'CANCELLED',
    'NEARLY EXPIRED',
    'NO RECORD FOUND',
  ];
  let safeVisaStatus = allowedVisaStatuses.includes(visa_status) ? visa_status : '';

  const query = `CALL crm.create_visa_check (@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@ovckhid)`;
  const args = [
    app_user_id,
    lead_id,
    task_id,
    contact_mode_list,
    visa_passport_no,
    safeVisaStatus,
    visa_expiry_date,
    visa_file_number,
    visa_emirates,
    visa_company_name,
    visa_designation,
    visa_contact_no,
    new_emirates_id,
    visa_emirates_id,
    unified_number,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("create_visa_check-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully created new visa check",
      data: rows,
    });
  } catch (err) {
    console.error("create_visa_check-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to save new visa check",
      data: err,
    });
  }
};

const postNewMOLCheckByLead = async (req, res) => {
  const {
    app_user_id,
    lead_id,
    task_id,
    contact_mode_list,
    mol_status,
    mol_work_permit_no,
    mol_company_name,
    mol_expiry_date,
    mol_salary,
    mol_passport_no,
  } = req.body;
  const query = `CALL crm.create_mol_check (@err,?,?,?,?,?,?,?,?,?,?,@omolckhid)`;
  const args = [
    app_user_id,
    lead_id,
    task_id,
    contact_mode_list,
    mol_status,
    mol_work_permit_no,
    mol_company_name,
    mol_expiry_date,
    mol_salary,
    mol_passport_no,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("create_visa_check-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully created new MOL check",
      data: rows,
    });
  } catch (err) {
    console.error("create_visa_check-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to save new MOL check",
      data: err,
    });
  }
};

const getWebTracingDetails = async (req, res) => {
  const { web_tracing_details_id, lead_id, tracing_source_type_id } = req.query;
  const query = `CALL crm.get_web_tracing_details (@err,?,?,?)`;
  const args = [web_tracing_details_id, lead_id, tracing_source_type_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get_mol_check-res::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched Web Tracing Details",
      data: rows,
    });
  } catch (err) {
    console.error("get_mol_check-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch Web Tracing Details",
      data: err,
    });
  }
};

const postNewWebTracing = async (req, res) => {
  const {
    app_user_id,
    lead_id,
    task_id,
    tracing_source_type_id,
    traced_details,
  } = req.body;
  const query = `CALL crm.create_web_tracing_details (@err,?,?,?,?,?,@owtdid)`;
  const args = [
    app_user_id,
    lead_id,
    task_id,
    tracing_source_type_id,
    traced_details,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("create_visa_check-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully created new web-tracing",
      data: rows,
    });
  } catch (err) {
    console.error("create_visa_check-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to save web-tracing",
      data: err,
    });
  }
};

const getTracingSourceType = async (req, res) => {
  const { tracing_source_type_id } = req.query;
  const query = `CALL crm.get_tracing_source_type (@err,?)`;
  const args = [tracing_source_type_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get_tracing_source_type-res::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched Tracing Source Type",
      data: rows,
    });
  } catch (err) {
    console.error("get_tracing_source_type-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch Tracing Source Type",
      data: err,
    });
  }
};

const getTracingDetails = async (req, res) => {
  const { tracing_details_id, lead_id } = req.query;
  const query = `CALL crm.get_tracing_details (@err,?,?)`;
  const args = [tracing_details_id, lead_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get_tracing_details-res::", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Tracing Details",
      data: rows,
    });
  } catch (err) {
    console.error("get_tracing_details-err>>>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch Web Tracing Details",
      data: err,
    });
  }
};

const postNewTracingDetails = async (req, res) => {
  const {
    app_user_id,
    lead_id,
    task_id,
    sql_details,
    company_trade_license_details,
    additional_details,
  } = req.body;
  const query = `CALL crm.create_tracing_details (@err,?,?,?,?,?,?,@otdid)`;
  const args = [
    app_user_id,
    lead_id,
    task_id,
    sql_details,
    company_trade_license_details,
    additional_details,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("create_visa_check-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully created new tracing details",
      data: rows,
    });
  } catch (err) {
    console.error("create_visa_check-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to save tracing details",
      data: err,
    });
  }
};

const getAllInactiveUsers = async (req, res) => {
  const { app_user_id, start_dtm, end_dtm, company_id } = req.query;
  const args = [app_user_id, start_dtm, end_dtm, company_id];
  const query = `CALL report.get_inactive_user_report(@err,?,?,?,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    const data = rows[0] || [];
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully retrieved all in-active users",
      data: [data],
      total: rows[1]?.[0]?.total_count || 0
    });
  } catch (err) {
    console.error("crm.getAllInactiveUsers-err:::", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch all in-active users",
      data: err,
    });
  }
};

const getAllTargets = async (req, res) => {
  const { app_user_id, target_id } = req.query;
  const args = [app_user_id, target_id];
  const query = `CALL crm.get_target(@err,?,?)`;

  try {
    // Fetch assigned targets (existing logic)
    const { rows: assignedRows } = await commonController.executeQuery(query, args);
    let assignedTargets = assignedRows[0] || [];

    // Fetch created targets (where user is creator, but not assigned)
    let createdTargets = [];
    if (app_user_id) {
      // We use the same proc but with NULL for app_user_id, then filter in JS for created_id
      const { rows: allRows } = await commonController.executeQuery(query, [null, target_id]);
      const allTargets = allRows[0] || [];
      createdTargets = allTargets.filter(t => String(t.created_id) === String(app_user_id));
    }

    // Merge assigned and created targets, removing duplicates by target_id
    const mergedTargetsMap = new Map();
    assignedTargets.forEach(t => mergedTargetsMap.set(t.target_id, t));
    createdTargets.forEach(t => mergedTargetsMap.set(t.target_id, t));
    const mergedTargets = Array.from(mergedTargetsMap.values());

    return res.status(200).json({
      errorCode: 0,
      message: "Successfully retrived all assigned and created targets",
      data: [mergedTargets],
    });
  } catch (err) {
    console.error("crm.getAllTargets-err:::", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch all assigned targets",
      data: err,
    });
  }
};

const postNewTargets = async (req, res) => {
  const {
    app_user_id,
    admin_id,
    senior_manager_id,
    team_manager_id,
    team_lead_id,
    agent_id,
    target_amount,
    target_assigned_by,
    working_days,
    achieved_target,
    from_date,
    to_date,
  } = req.body;
  const query = `CALL crm.create_target (@err,?,?,?,?,?,?,?,?,?,?,?,?,@otid)`;
  const args = [
    app_user_id,
    admin_id,
    senior_manager_id,
    team_manager_id,
    team_lead_id,
    agent_id,
    target_amount,
    target_assigned_by,
    working_days,
    achieved_target,
    from_date,
    to_date,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("postNewTargets-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Target assigned successfully",
      data: rows,
    });
  } catch (err) {
    console.error("postNewTargets-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to assign target",
      data: err,
    });
  }
};

const editAssignedTarget = async (req, res) => {
  const {
    app_user_id,
    target_id,
    admin_id,
    senior_manager_id,
    team_manager_id,
    team_lead_id,
    agent_id,
    target_amount,
    target_assigned_by,
    working_days,
    achieved_target,
    from_date,
    to_date,
    in_status,
  } = req.body;
  const query = `CALL crm.edit_target (@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    target_id,
    admin_id,
    senior_manager_id,
    team_manager_id,
    team_lead_id,
    agent_id,
    target_amount,
    target_assigned_by,
    working_days,
    achieved_target,
    from_date,
    to_date,
    in_status,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("editAssignedTarget-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Target edited successfully",
      data: rows,
    });
  } catch (err) {
    console.error("editAssignedTarget-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to edit target",
      data: err,
    });
  }
};

const validateEnteriesByTaskId = async (req, res) => {
  const { task_id, stage } = req.body;
  const query = `CALL crm.get_mandatory_entries_by_task_id_stage (@err,?,?,@occ);SELECT @occ;`;
  const args = [task_id, stage];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    return res.status(200).json({
      errorCode: 0,
      message: "Validated check by stage",
      data: rows[1],
    });
  } catch (err) {
    console.error("get_mandatory_entries_by_task_id_stage-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to validated check by stage",
      data: err,
    });
  }
};

// const sanitize = v => (v === null || v === undefined ? '' : v);

// // Helper function to convert empty strings/undefined/null to actual null for numeric ID parameters,
// // or to empty string for non-numeric or when a value is present.
// const toSqlParam = (value, isNumericId = false) => {
//   if (value === null || value === undefined || value === '') {
//     return isNumericId ? null : ''; // Send actual null for numeric IDs if empty/not provided
//   }
//   return value; // Return the original value if it's not empty/null/undefined
// };

const getTodaysTasks = async (req, res) => {
  const {
    app_user_id,
    task_id,
    task_type_id,
    disposition_code_id,
    task_status_type_id,
    lead_id,
    company_id,
    task_category
  } = req.query;

  if (!app_user_id) {
    return res.status(400).json({
      errorCode: 1,
      message: "app_user_id is required",
      data: null
    });
  }

  const query = `CALL crm.get_task(@err, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const args = [
    app_user_id,
    task_id,
    task_type_id,
    disposition_code_id,
    task_status_type_id,
    lead_id,
    company_id,
    task_category || 'TODAY'
  ];

  try {
    const { rows } = await commonController.executeQuery(query, args);

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // Get user's role
    const userRoleQuery = `
      SELECT r.role_name 
      FROM user.user_role_company urc
      JOIN user.role r ON urc.role_id = r.role_id
      WHERE urc.user_id = ?
    `;
    const { rows: roleRows } = await commonController.executeQuery(userRoleQuery, [app_user_id]);
    const userRole = roleRows[0]?.role_name;

    // Filter tasks based on role hierarchy for today's tasks
    let filteredTasks = (rows[0] || []).filter(task => {
      const isToday = task.eod_target_dtm && task.eod_target_dtm.startsWith(todayStr);
      if (!isToday) return false;

      const status = String(task.task_status_type_name || '').toUpperCase();
      const isActiveStatus = ['IN PROGRESS', 'PENDING', 'COMPLETED'].includes(status);
      if (!isActiveStatus) return false;

      // For AGENT role - show only tasks assigned to them
      if (userRole === 'AGENT') {
        return String(task.assigned_to) === String(app_user_id);
      }

      // For TEAM LEAD role - show tasks assigned to them
      if (userRole === 'TEAM LEAD') {
        return String(task.assigned_to) === String(app_user_id);
      }

      // For TEAM MANAGER role - show tasks assigned to them
      if (userRole === 'TEAM MANAGER') {
        return String(task.assigned_to) === String(app_user_id);
      }

      // For SENIOR MANAGER role - show tasks assigned to them
      if (userRole === 'SENIOR MANAGER') {
        return String(task.assigned_to) === String(app_user_id);
      }

      // For ADMIN role - show tasks assigned to them
      if (userRole === 'ADMIN') {
        return String(task.assigned_to) === String(app_user_id);
      }

      return false;
    });

    return res.status(200).json({
      errorCode: 0,
      message: "Successfully retrieved today's tasks",
      data: filteredTasks
    });
  } catch (err) {
    console.error("crm.getTodaysTasks-err:::", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch today's tasks",
      data: err
    });
  }
};

const getEscalationTasks = async (req, res) => {
  const {
    app_user_id,
    task_id,
    task_type_id,
    disposition_code_id,
    task_status_type_id,
    lead_id,
    company_id,
    task_category
  } = req.query;

  if (!app_user_id) {
    return res.status(400).json({
      errorCode: 1,
      message: "app_user_id is required",
      data: null
    });
  }

  const query = `CALL crm.get_task(@err, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const args = [
    app_user_id,
    task_id,
    task_type_id,
    disposition_code_id,
    task_status_type_id,
    lead_id,
    company_id,
    task_category || 'ESCALATION'
  ];

  try {
    const { rows } = await commonController.executeQuery(query, args);
    
    // Get user's role
    const userRoleQuery = `
      SELECT r.role_name 
      FROM user.user_role_company urc
      JOIN user.role r ON urc.role_id = r.role_id
      WHERE urc.user_id = ?
    `;
    const { rows: roleRows } = await commonController.executeQuery(userRoleQuery, [app_user_id]);
    const userRole = roleRows[0]?.role_name;

    // Get all necessary user IDs based on role hierarchy
    let agentIds = [];
    let teamLeadIds = [];
    let managerIds = [];
    let adminIds = [];

    // Get ADMIN user IDs for escalation task filtering
    const { rows: adminRows } = await commonController.executeQuery(
      `SELECT u.user_id 
       FROM user.user u 
       JOIN user.user_role_company urc ON u.user_id = urc.user_id 
       JOIN user.role r ON urc.role_id = r.role_id 
       WHERE r.role_name = 'ADMIN'`
    );
    adminIds = adminRows.map(row => row.user_id);

    if (userRole === 'TEAM LEAD') {
      // Get agents who report to this team lead
      const { rows: agentRows } = await commonController.executeQuery(
        'SELECT u.user_id FROM user.user u WHERE u.reporting_to_id = ?',
        [app_user_id]
      );
      agentIds = agentRows.map(row => row.user_id);
    } else if (userRole === 'TEAM MANAGER') {
      // Get team leads who report to this manager
      const { rows: teamLeadRows } = await commonController.executeQuery(
        'SELECT u.user_id FROM user.user u WHERE u.reporting_to_id = ?',
        [app_user_id]
      );
      teamLeadIds = teamLeadRows.map(row => row.user_id);

      // Get agents who report to these team leads
      for (const teamLeadId of teamLeadIds) {
        const { rows: agentRows } = await commonController.executeQuery(
          'SELECT u.user_id FROM user.user u WHERE u.reporting_to_id = ?',
          [teamLeadId]
        );
        agentIds = [...agentIds, ...agentRows.map(row => row.user_id)];
      }
    } else if (userRole === 'SENIOR MANAGER') {
      // Get team managers who report to this senior manager
      const { rows: managerRows } = await commonController.executeQuery(
        'SELECT u.user_id FROM user.user u WHERE u.reporting_to_id = ?',
        [app_user_id]
      );
      managerIds = managerRows.map(row => row.user_id);

      // Get team leads who report to these managers
      for (const managerId of managerIds) {
        const { rows: teamLeadRows } = await commonController.executeQuery(
          'SELECT u.user_id FROM user.user u WHERE u.reporting_to_id = ?',
          [managerId]
        );
        teamLeadIds = [...teamLeadIds, ...teamLeadRows.map(row => row.user_id)];
      }

      // Get agents who report to these team leads
      for (const teamLeadId of teamLeadIds) {
        const { rows: agentRows } = await commonController.executeQuery(
          'SELECT u.user_id FROM user.user u WHERE u.reporting_to_id = ?',
          [teamLeadId]
        );
        agentIds = [...agentIds, ...agentRows.map(row => row.user_id)];
      }
    }

    // Filter tasks based on role hierarchy for escalation
    const filteredTasks = rows[0] ? rows[0].filter(task => {
      const status = String(task.task_status_type_name || '').toUpperCase();
      const isNotCompleted = ['IN PROGRESS', 'PENDING'].includes(status);
      const isNotUpdatedToday = !task.last_task_update_dtm || 
        new Date(task.last_task_update_dtm).toDateString() !== new Date().toDateString();

      // For AGENT role - no escalation tasks (they only see today's tasks)
      if (userRole === 'AGENT') {
        return false;
      }

      // For TEAM LEAD role - show tasks assigned by them to agents that need attention
      // OR tasks assigned by ADMIN to agents who report to this team lead
      if (userRole === 'TEAM LEAD') {
        return (
          (task.assigned_by === parseInt(app_user_id) && agentIds.includes(parseInt(task.assigned_to))) ||
          (adminIds.includes(parseInt(task.assigned_by)) && agentIds.includes(parseInt(task.assigned_to)))
        ) && 
        isNotCompleted && 
        isNotUpdatedToday;
      }

      // For TEAM MANAGER role - show escalation tasks for any of their team leads or agents (regardless of who assigned)
      // Including tasks assigned by ADMIN to their team leads or agents
      if (userRole === 'TEAM MANAGER') {
        return (
          teamLeadIds.includes(parseInt(task.assigned_to)) ||
          agentIds.includes(parseInt(task.assigned_to))
        ) && 
        isNotCompleted && 
        isNotUpdatedToday;
      }

      // For SENIOR MANAGER role - show tasks assigned by them to team managers, team leads, and agents
      // OR tasks assigned by ADMIN to anyone in their hierarchy
      if (userRole === 'SENIOR MANAGER') {
        return (
          (task.assigned_by === parseInt(app_user_id) && (managerIds.includes(parseInt(task.assigned_to)) || teamLeadIds.includes(parseInt(task.assigned_to)) || agentIds.includes(parseInt(task.assigned_to)))) ||
          (adminIds.includes(parseInt(task.assigned_by)) && (managerIds.includes(parseInt(task.assigned_to)) || teamLeadIds.includes(parseInt(task.assigned_to)) || agentIds.includes(parseInt(task.assigned_to)))) ||
          (managerIds.includes(parseInt(task.assigned_by)) && (teamLeadIds.includes(parseInt(task.assigned_to)) || agentIds.includes(parseInt(task.assigned_to)))) ||
          (teamLeadIds.includes(parseInt(task.assigned_by)) && agentIds.includes(parseInt(task.assigned_to)))
        ) && 
        isNotCompleted && 
        isNotUpdatedToday;
      }

      // For ADMIN role - show all tasks that need attention
      if (userRole === 'ADMIN') {
        return isNotCompleted && isNotUpdatedToday;
      }

      return false;
    }) : [];

    return res.status(200).json({
      errorCode: 0,
      message: "Successfully retrieved escalation tasks",
      data: filteredTasks
    });
  } catch (err) {
    console.error("crm.getEscalationTasks-err:::", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch escalation tasks",
      data: err
    });
  }
};

const getTasksCount = async (req, res) => {
  const {
    app_user_id,
    task_id,
    task_type_id,
    disposition_code_id,
    task_status_type_id,
    lead_id,
    company_id
  } = req.query;

  if (!app_user_id) {
    return res.status(400).json({
      errorCode: 1,
      message: "app_user_id is required",
      data: null
    });
  }

  const query = `CALL crm.get_task(@err, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const args = [
    app_user_id,
    task_id,
    task_type_id,
    disposition_code_id,
    task_status_type_id,
    lead_id,
    company_id,
    'TODAY'
  ];

  try {
    const { rows } = await commonController.executeQuery(query, args);
    // Filter tasks to only include PENDING, IN PROGRESS, and COMPLETED status
    const filteredTasks = rows[0] ? rows[0].filter(task => 
      ['PENDING', 'IN PROGRESS', 'COMPLETED'].includes(task.task_status_type_name)
    ) : [];
    
    const count = filteredTasks.length;
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully retrieved task count",
      data: [{ count }]
    });
  } catch (err) {
    console.error("crm.getTasksCount-err:::", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch task count",
      data: err
    });
  }
};

const getAccountEmiratesIds = async (req, res) => {
  const { lead_id } = req.query;

  if (!lead_id) {
    return res.status(400).json({
      errorCode: 1,
      message: "lead_id is required",
      data: null
    });
  }

  try {
    // Get Emirates ID from main account with creation date
    const mainAccountQuery = `
      SELECT emirates_id_number, created_dtm 
      FROM crm.leads 
      WHERE lead_id = ? AND emirates_id_number IS NOT NULL AND emirates_id_number != ''
    `;
    const mainAccountResult = await commonController.executeQuery(mainAccountQuery, [lead_id]);
    
    // Get Emirates IDs from visa checks with creation date, ordered by latest first
    // Separate queries to ensure proper ordering and avoid UNION issues
    const newEmiratesQuery = `
      SELECT TRIM(new_emirates_id) as emirates_id, created_dtm, 'visa_check' as source
      FROM crm.visa_check 
      WHERE lead_id = ? 
        AND new_emirates_id IS NOT NULL 
        AND TRIM(new_emirates_id) != ''
        AND status = 1
      ORDER BY created_dtm DESC
    `;
    const newEmiratesResult = await commonController.executeQuery(newEmiratesQuery, [lead_id]);
    
    const visaEmiratesQuery = `
      SELECT TRIM(visa_emirates_id) as emirates_id, created_dtm, 'visa_check' as source
      FROM crm.visa_check 
      WHERE lead_id = ? 
        AND visa_emirates_id IS NOT NULL 
        AND TRIM(visa_emirates_id) != ''
        AND status = 1
      ORDER BY created_dtm DESC
    `;
    const visaEmiratesResult = await commonController.executeQuery(visaEmiratesQuery, [lead_id]);
    
    // Get Emirates IDs from stage table with creation date, ordered by latest first
    const stageQuery = `
      SELECT DISTINCT emirates_id_number, created_dtm, 'stage' as source
      FROM stage.lead_stage 
      WHERE customer_id = (
        SELECT customer_id FROM crm.leads WHERE lead_id = ?
      ) 
        AND product_account_number = (
          SELECT product_account_number FROM crm.leads WHERE lead_id = ?
        )
        AND emirates_id_number IS NOT NULL 
        AND emirates_id_number != ''
        AND emirates_id_number != ' '
      ORDER BY created_dtm DESC
    `;
    const stageResult = await commonController.executeQuery(stageQuery, [lead_id, lead_id]);
    
    // Combine all Emirates IDs with their creation dates
    const emiratesIdsWithDates = [];
    
    // Add main account Emirates ID if it exists
    if (mainAccountResult.rows[0] && mainAccountResult.rows[0].emirates_id_number) {
      emiratesIdsWithDates.push({
        emirates_id: mainAccountResult.rows[0].emirates_id_number.trim(),
        created_dtm: mainAccountResult.rows[0].created_dtm,
        source: 'main_account'
      });
    }
    
    // Add Emirates IDs from visa checks (new_emirates_id)
    newEmiratesResult.rows.forEach(row => {
      if (row.emirates_id && row.emirates_id.trim() !== '') {
        emiratesIdsWithDates.push({
          emirates_id: row.emirates_id.trim(),
          created_dtm: row.created_dtm,
          source: row.source
        });
      }
    });
    
    // Add Emirates IDs from visa checks (visa_emirates_id)
    visaEmiratesResult.rows.forEach(row => {
      if (row.emirates_id && row.emirates_id.trim() !== '') {
        emiratesIdsWithDates.push({
          emirates_id: row.emirates_id.trim(),
          created_dtm: row.created_dtm,
          source: row.source
        });
      }
    });
    
    // Add stage table Emirates IDs
    stageResult.rows.forEach(row => {
      if (row.emirates_id_number && row.emirates_id_number.trim() !== '') {
        emiratesIdsWithDates.push({
          emirates_id: row.emirates_id_number.trim(),
          created_dtm: row.created_dtm,
          source: row.source
        });
      }
    });
    
    // Remove duplicates and sort by creation date (latest first)
    const uniqueEmiratesIdsMap = new Map();
    emiratesIdsWithDates.forEach(item => {
      const cleanEmiratesId = item.emirates_id.trim();
      if (cleanEmiratesId && cleanEmiratesId !== '') {
        // If this Emirates ID already exists, keep the one with the latest creation date
        if (!uniqueEmiratesIdsMap.has(cleanEmiratesId) || 
            new Date(item.created_dtm) > new Date(uniqueEmiratesIdsMap.get(cleanEmiratesId).created_dtm)) {
          uniqueEmiratesIdsMap.set(cleanEmiratesId, item);
        }
      }
    });
    
    // Convert to array, sort by creation date (latest first), and format for dropdown
    const uniqueEmiratesIds = Array.from(uniqueEmiratesIdsMap.values())
      .filter(item => item.emirates_id && item.emirates_id.trim() !== '')
      .sort((a, b) => new Date(b.created_dtm) - new Date(a.created_dtm))
      .map((item, index) => ({
        value: item.emirates_id,
        label: item.emirates_id,
        source: item.source,
        created_dtm: item.created_dtm,
        isLatest: index === 0 // Mark the first one (latest) as the latest
      }));
    
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully retrieved Emirates IDs",
      data: uniqueEmiratesIds
    });
  } catch (err) {
    console.error("crm.getAccountEmiratesIds-err:::", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch Emirates IDs",
      data: err
    });
  }
};

const addEmiratesIdToAccount = async (req, res) => {
  const { 
    app_user_id, 
    lead_id, 
    emirates_id_number, 
    source = 'MANUAL' 
  } = req.body;

  if (!app_user_id || !lead_id || !emirates_id_number) {
    return res.status(400).json({
      errorCode: 1,
      message: "app_user_id, lead_id, and emirates_id_number are required",
      data: null
    });
  }

  try {
    // Check if this Emirates ID already exists for this lead in any source
    const checkQuery = `
      SELECT COUNT(1) as count 
      FROM (
        SELECT emirates_id_number as eid FROM crm.leads WHERE lead_id = ? AND emirates_id_number IS NOT NULL AND TRIM(emirates_id_number) != ''
        UNION
        SELECT new_emirates_id as eid FROM crm.visa_check WHERE lead_id = ? AND new_emirates_id IS NOT NULL AND TRIM(new_emirates_id) != '' AND status = 1
        UNION
        SELECT visa_emirates_id as eid FROM crm.visa_check WHERE lead_id = ? AND visa_emirates_id IS NOT NULL AND TRIM(visa_emirates_id) != '' AND status = 1
        UNION
        SELECT emirates_id_number as eid FROM stage.lead_stage WHERE customer_id = (SELECT customer_id FROM crm.leads WHERE lead_id = ?) AND product_account_number = (SELECT product_account_number FROM crm.leads WHERE lead_id = ?) AND emirates_id_number IS NOT NULL AND TRIM(emirates_id_number) != ''
      ) all_eids
      WHERE eid = ?
    `;
    const checkResult = await commonController.executeQuery(checkQuery, [lead_id, lead_id, lead_id, lead_id, lead_id, emirates_id_number.trim()]);
    
    if (checkResult.rows[0].count > 0) {
      return res.status(400).json({
        errorCode: 1,
        message: "Emirates ID already exists for this account",
        data: null
      });
    }

    // Add Emirates ID to visa_check table with both visa_emirates and new_emirates_id fields
    const insertQuery = `
      INSERT INTO crm.visa_check (
        lead_id, 
        visa_emirates, 
        new_emirates_id, 
        visa_emirates_id,
        visa_status,
        status, 
        created_id, 
        created_dtm, 
        modified_id, 
        modified_dtm
      ) VALUES (?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)
    `;
    
    await commonController.executeQuery(insertQuery, [
      lead_id, 
      emirates_id_number.trim(), 
      emirates_id_number.trim(), 
      emirates_id_number.trim(),
      source,
      app_user_id, 
      app_user_id
    ]);

    return res.status(200).json({
      errorCode: 0,
      message: "Emirates ID added successfully",
      data: { lead_id, emirates_id_number }
    });
  } catch (err) {
    console.error("crm.addEmiratesIdToAccount-err:::", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to add Emirates ID",
      data: err
    });
  }
};

module.exports = {
  validateEnteriesByTaskId,
  editAssignedTarget,
  postNewTargets,
  getAllTargets,
  fetchAllLeads,
  getAllDispositionTypes,
  getAllTaskTypes,
  getAllTaskStatusTypes,
  createNewTask,
  fetchAllTasks,
  uploadDocuments,
  getDocuments,
  putTaskByTaskId,
  fetchAllNotes,
  createNewNotes,
  updateLead,
  getLeadsBySearchParams,
  fetchAllCrmUserLogActivity,
  updateNotes,
  getAllLeadStatusTypes,
  getDispositionCode,
  createDispositionCode,
  editDispositionCode,
  getDashboardCounts,
  getTargetStats,
  getSQParameterType,
  createSQCheckScores,
  createNewPaymentLedgerEntry,
  getAllLeadsPaymentLedgerEntry,
  editPaymentLedgerEntry,
  postNewContact,
  postNewAddress,
  getAllContactsByLead,
  getAllAddressByLead,
  fetchSQCheckScores,
  getAllMOLCheckByLead,
  getAllVisaCheckByLead,
  postNewVisaCheckByLead,
  postNewMOLCheckByLead,
  getTracingSourceType,
  postNewWebTracing,
  getWebTracingDetails,
  postNewTracingDetails,
  getTracingDetails,
  getAllInactiveUsers,
  getTodaysTasks,
  getEscalationTasks,
  getTasksCount,
  getAccountEmiratesIds,
  addEmiratesIdToAccount,
};
