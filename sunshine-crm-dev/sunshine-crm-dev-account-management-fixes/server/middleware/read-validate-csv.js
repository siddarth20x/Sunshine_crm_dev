const fs = require("fs");
const model = require("./../models/file-upload.model");
const Readable = require("stream").Readable;
const fastcsv = require("fast-csv");
// const accountsUploadSchema = require("../models/file-upload.model");

const processCSV = async (req, res, next) => {
  const results = [];
  let keys;
  var finalArr = [];
  let headerMapping = {};

  // Check if file is attached in the request
  if (!req.file) {
    return res.status(400).json({ error: "CSV file not found" });
  }
  
  // Check file format - only allow CSV files
  const csvFile = req.file;
  const fileExtension = csvFile.originalname.toLowerCase().split('.').pop();
  
  if (fileExtension !== 'csv') {
    return res.status(400).json({ 
      error: "Invalid file format", 
      message: "Only CSV file format is allowed. Please upload a file with .csv extension." 
    });
  }
  // Create a readable stream from the file buffer
  const stream = new Readable();
  stream.push(csvFile.buffer);
  stream.push(null);

  // Read the CSV file
  stream
    .pipe(fastcsv.parse())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", async () => {
      for (let i = 0; i < results.length; i++) {
        if (i === 0) {
          keys = results[i];
          // Build header mapping
          keys.forEach((element) => {
            let newKey = element.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
            const normalizedKey = newKey.replace(/_+/g, "_");
            if (
              normalizedKey === "contactable_non_contactable" ||
              normalizedKey === "contactable_status" ||
              normalizedKey === "contactable"
            ) {
              newKey = "contactable_status";
            }
            headerMapping[newKey] = element; // Map normalized key to original header
          });
        } else if (i > 0) {
          convertToArrOfObjFn(keys, results[i]);
        }
      }

      function convertToArrOfObjFn(arr1, arr2) {
        const obj = {};
        arr1.forEach((element, index) => {
          // Normalize key for matching
          const normalized = element.trim().toLowerCase();
          let newKey = element.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
          
          // Remove specific substrings from the keys
          if (newKey.includes("cust_id___relationship_no")) {
            newKey = newKey.replace("___relationship_no", "");
          }
          if (newKey.includes("account_no___agreement_no")) {
            newKey = newKey.replace("___agreement_no", "");
          }
          // Handle all column name mappings and variations
          const columnMappings = {
            // New fields mappings
            "finware_acn01": "finware_acn01",
            "fresh_stab": "fresh_stab",
            "fresh___stab": "fresh_stab",
            "dpd_strin": "dpd_string",
            "dpd_string": "dpd_string",
            "cycle_statement": "cycle_statement",
            "card_auth": "card_auth",
            "dpd_r": "dpd_r",
            "mindue_manual": "mindue_manual",
            "rb_amount": "rb_amount",
            "overdue_amount": "overdue_amount",
            "due_since_date": "due_since_date",
            "monthly_income": "monthly_income",
            "office_address": "office_address",
            "friend_residence_phone": "friend_residence_phone",
            "last_month_paid_unpaid": "last_month_paid_unpaid",
            "last_usage_date": "last_usage_date",
            "dcore_id": "dcore_id",
            // Existing mappings
            "account_no": "account_number",
            "product_account_no": "product_account_number",
            "bkt_status": "bucket_status",
            "passport_no": "passport_number",
            "sme_account_name": "business_name",
            "tos_amount": "total_outstanding_amount",
            "pos_amount": "principal_outstanding_amount",
            "last_payment_amount": "last_paid_amount",
            "last_payment_date": "last_paid_date",
            "cust_id": "customer_id",
            "dob": "date_of_birth"
          };
          
          // Apply column mapping if exists
          if (columnMappings[newKey]) {
            newKey = columnMappings[newKey];
          }
          // Handle contactable status field variations
          const normalizedKey = newKey.replace(/_+/g, "_");
          if (
            normalizedKey === "contactable_non_contactable" ||
            normalizedKey === "contactable_status" ||
            normalizedKey === "contactable" ||
            newKey === "contactable_non_contactable" ||
            newKey === "contactable"
          ) {
            newKey = "contactable_status";
          }
          // Add both: normalized key and original key
          obj[newKey] = arr2[index];      // normalized key (for backend/validation)
          obj[element] = arr2[index];     // original key (for frontend display)
        });
        finalArr.push(obj);
      }

      // Pass the processed CSV data to the validateCSV function
      const validateResponse = await validateCSV({ body: finalArr });

      if (validateResponse.errors && validateResponse.errors.length) {
        return res.status(400).json({
          errorCode: 1,
          message: "CSV validation failed",
          errors: validateResponse.errors,
        });
      }

      res.status(200).json({
        errorCode: 0,
        message: "CSV processed and validated successfully",
        data: finalArr,
        headerMapping
      });
    });
};

const validateCSV = async (req) => {
  console.log("validate csv function call");

  try {
    const csvData = req.body;
    const errors = [];
    const scientificNotationRegex = /^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/;

    const mandatoryFields = [
      "account_number",
      "product_type", 
      "product_account_number",
      "customer_name",
      "allocation_status",
      "customer_id",  // Fixed: was cust_id, should be customer_id
      "banker_name",
      "senior_manager_id",
      "team_lead_id",
      "team_manager_id",
      "assigned_to",
      "contactable_status",
      "disposition_status",
      "disposition_status_name",
      "disposition_code"
    ];

    const isValidDate = (value) => {
      if (!value || typeof value !== "string") return false;
      const regex = /^\d{1,2}-[A-Za-z]{3}-\d{4}$/;
      if (!regex.test(value)) return false;
    
      const [day, month, year] = value.split("-");
      const validMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
      if (!validMonths.includes(month)) return false;
      
      const numericDay = parseInt(day, 10);
      const numericYear = parseInt(year, 10);
    
      if (isNaN(numericDay) || numericDay < 1 || numericDay > 31) return false;
      if (isNaN(numericYear) || numericYear < 1900 || numericYear > 9999) return false;
    
      return {
        isValid: true,
        formattedDate: `${month} ${numericDay}, ${numericYear}`,
      };
    };

    const isNumber = (value) => {
      if (typeof value === "number" && !isNaN(value)) {
        return true;
      }

      if (typeof value === "string") {
        const decimalRegex = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;
        if (decimalRegex.test(value)) {
          return true;
        }
      }

      return false;
    };

    const isString = (value) => {
      return typeof value === "string" || value instanceof String;
    };

    const dateFields = [
      "date_of_birth",  // Fixed: was dob, should be date_of_birth
      "date_of_woff", 
      "withdraw_date",
      "last_paid_date",  // Fixed: was last_payment_date, should be last_paid_date
      "due_since_date",
      "last_usage_date",
      "visa_expiry_date",
      "mol_expiry_date"
    ];

    const numberFields = [
      "credit_limit",
      "minimum_payment",
      "total_outstanding_amount",
      "principal_outstanding_amount", 
      "ghrc_offer_1",
      "ghrc_offer_2",
      "ghrc_offer_3",
      "last_paid_amount",
      "rb_amount",
      "overdue_amount",
      "monthly_income",
    ];

    // Valid visa status values
    const validVisaStatuses = ["ACTIVE", "VOILATED", "CANCELLED", "NEARLY EXPIRED", "NO RECORD FOUND"];
    
    // Valid MOL status values
    const validMolStatuses = ["ACTIVE", "INACTIVE", "UNDER PROCESS", "FINED", "NO RECORD FOUND"];

    csvData.forEach((record, rowIndex) => {
      console.log('Validating record:', record); // Debug log
      const recordErrors = [];

      // Replace empty strings with null
      Object.keys(record).forEach((key) => {
        if (record[key] === "") {
          record[key] = null;
        }
      });

      // Check mandatory fields, but handle contactable_status and related fields specially
      mandatoryFields.forEach((field) => {
        // Skip the 4 special fields for now
        if (
          field === "contactable_status" ||
          field === "disposition_status" ||
          field === "disposition_status_name" ||
          field === "disposition_code"
        ) {
          return;
        }
        if (!record[field]) {
          recordErrors.push({
            field,
            message: `Mandatory field '${field}' is missing or empty`,
            row: rowIndex + 1
          });
        }
      });

      // Special logic for contactable_status and related fields
      const cs = record.contactable_status;
      const ds = record.disposition_status;
      const dsn = record.disposition_status_name;
      const dc = record.disposition_code;

      // Only validate disposition fields if contactable_status is present (any value)
      if (cs) {
        if (!ds) {
          recordErrors.push({
            field: "disposition_status",
            message: "disposition_status is required when contactable_status is filled",
            row: rowIndex + 1
          });
        }
        if (!dsn) {
          recordErrors.push({
            field: "disposition_status_name",
            message: "disposition_status_name is required when contactable_status is filled",
            row: rowIndex + 1
          });
        }
        if (!dc) {
          recordErrors.push({
            field: "disposition_code",
            message: "disposition_code is required when contactable_status is filled",
            row: rowIndex + 1
          });
        }
      }
      // If contactable_status is empty, do not validate disposition fields at all

      // Remove extra validation for 'CONTACTED' and 'NON CONTACTED' disposition fields
      // Keep web_tracing_details check for NON CONTACTED if needed
      // if (record.contactable_status === 'NON CONTACTED') {
      //   if (!record.web_tracing_details) {
      //     recordErrors.push({
      //       field: 'contactable_status',
      //       message: 'For NON CONTACTED status, web tracing details are required',
      //       row: rowIndex + 1
      //     });
      //   }
      // }

      // Validate task type
      // Removed validation for validTaskTypes

      // Validate disposition code
      // Removed validation for validDispositionCodes

      // Additional validation for specific combinations
      if (record.contactable_status === 'CONTACTED') {
        if (!record.disposition_status || !record.disposition_code) {
          recordErrors.push({
            field: 'contactable_status',
            message: 'For CONTACTED status, both disposition status and code are required',
            row: rowIndex + 1
          });
        }
      }

      // Validate visa status
      if (record.visa_status && !validVisaStatuses.includes(record.visa_status.toUpperCase())) {
        recordErrors.push({
          field: "visa_status",
          message: `Please enter a valid visa status. Allowed values: ACTIVE, VOILATED, CANCELLED, NEARLY EXPIRED, NO RECORD FOUND`,
          row: rowIndex + 1
        });
      }

      // Validate MOL status
      if (record.mol_status && !validMolStatuses.includes(record.mol_status.toUpperCase())) {
        recordErrors.push({
          field: "mol_status",
          message: `Please enter a valid MOL status. Allowed values: ACTIVE, INACTIVE, UNDER PROCESS, FINED, NO RECORD FOUND`,
          row: rowIndex + 1
        });
      }



      // Validate other fields
      Object.keys(record).forEach((key) => {
        const value = record[key];

        if (value === null) {
          return;
        }

        if (dateFields.includes(key)) {
          if (value && !isValidDate(value)) {
            recordErrors.push({
              field: key,
              message: `Expected a valid Date for field '${key}' as 'dd-mmm-yyyy', but got '${value}'`,
              row: rowIndex + 1
            });
          }
        } else if (numberFields.includes(key)) {
          if (!isNumber(value)) {
            recordErrors.push({
              field: key,
              message: `Expected a valid number for field '${key}', but got '${value}'`,
              row: rowIndex + 1
            });
          }
        } else if (scientificNotationRegex.test(value)) {
          recordErrors.push({
            field: key,
            message: `Field "${key}" contains an invalid scientific notation. Please check the file and try uploading`,
            row: rowIndex + 1
          });
        } else {
          if (!isString(value)) {
            recordErrors.push({
              field: key,
              message: `Expected a valid string for field '${key}', but got '${value}'`,
              row: rowIndex + 1
            });
          }
        }
      });

      if (recordErrors.length) {
        errors.push(...recordErrors);
      }
    });

    if (errors.length) {
      return {
        errorCode: 1,
        message: "CSV validation failed",
        errors: errors
      };
    }

    return {
      errorCode: 0,
      message: "CSV validation successful",
      data: csvData
    };
  } catch (error) {
    console.error("Error validating CSV:", error);
    return {
      errorCode: 1,
      message: "Internal Server Error",
      errors: [{
        field: "system",
        message: "An unexpected error occurred during validation",
        row: 0
      }]
    };
  }
};

module.exports = { processCSV, validateCSV };
