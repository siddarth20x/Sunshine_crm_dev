const commonController = require("../../helpers/common");
const connection = require("../../config/db");
const pwd = require("../../middleware/password-bcrypt");
const auth = require("../../middleware/jwt");
const fs = require("fs");
const fastcsv = require("fast-csv");
const { create } = require("domain");
const Readable = require("stream").Readable;

const uploadLeadStageFromCSV = async (req, res) => {
  try {
    const {
      company_id,
      user_id,
      do_not_follow_flag,
      allocation_type,
      file_upload_id,
    } = req.query;
    
    if (!company_id || !user_id) {
      return res.status(400).json({
        errorCode: 1,
        message:
          "Missing required parameters: company_id and user_id are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        errorCode: 1,
        message: "No file uploaded",
      });
    }

    const results = [];
    const stream = new Readable();
    stream.push(req.file.buffer);
    stream.push(null);

    // Define the expected column order for the CSV data (based on the template header)
    // CSV Template Header Order (83 columns):
    // Senior Manager Id, Team Manager Id, Team Lead Id, Assigned To, Account no - Agreement No, Product Type, Product Account No, Agreement ID, FINWARE_ACN01, Allocation Status, Cust Id - Relationship No, SME Account Name, Customer Name, Credit Limit, TOS Amount, POS Amount, FRESH/STAB, Cycle Statement, BKT Status, Card_Auth, DPD_R, Mindue Manual, RB Amount, Overdue Amount, Passport No, DOB, Emirates ID Number, DUE SINCE DATE, Vintage, Date of WOFF, Nationality, Mobile Number, Email ID, Monthly Income, Employer Details, Designation, Company Contact, Office_Address, Home Country Number, Friend_residence_phone, Minimum Payment, GHRC Offer 1, GHRC Offer 2, GHRC Offer 3, Withdraw Date, Home Country Address, City, Pincode, State, Father Name, Mother Name, Spouse Name, Last payment amount, Last payment date, Last month Paid Unpaid, Last Usage Date, DPD Strin, PLI Status, Execution Status, Banker name, Feedback, Contactable / Non-contactable, Disposition Code, Disposition Status Name, Visa Status, Visa Passport No, Visa Expiry date, Visa File Number, Visa Emirates, Company Name in Visa, Designation in Visa, Contact Number in Visa, Visa Emirates ID, Unified Number, MOL Status, MOL Passport No, MOL Expiry date, MOL Work Permit No, Salary in MOL, Company Name in MOL, Traced Source, Traced Details, SQL Details, Company Trade License Details, Additional Details, DCORE ID
    const expectedColumns = [
      'senior_manager_id', 'team_manager_id', 'team_lead_id', 'assigned_to',
      'account_number', 'product_type', 'product_account_number', 'agreement_id',
      'finware_acn01', 'allocation_status', 'customer_id', 'business_name',
      'customer_name', 'credit_limit', 'total_outstanding_amount', 'principal_outstanding_amount',
      'fresh_stab', 'cycle_statement', 'bucket_status', 'card_auth',
      'dpd_r', 'mindue_manual', 'rb_amount', 'overdue_amount',
      'passport_number', 'date_of_birth', 'emirates_id_number', 'due_since_date',
      'vintage', 'date_of_woff', 'nationality', 'mobile_number',
      'email_id', 'monthly_income', 'employer_details', 'designation',
      'company_contact', 'office_address', 'home_country_number', 'friend_residence_phone',
      'minimum_payment', 'ghrc_offer_1', 'ghrc_offer_2', 'ghrc_offer_3',
      'withdraw_date', 'home_country_address', 'city', 'pincode',
      'state', 'father_name', 'mother_name', 'spouse_name',
      'last_paid_amount', 'last_paid_date', 'last_month_paid_unpaid', 'last_usage_date',
      'dpd_string', 'pli_status', 'execution_status',
      'banker_name', 'feedback', 'contactable_non_contactable', 'disposition_stage',
      'disposition_status_name', 'visa_status', 'visa_passport_no',
      'visa_expiry_date', 'visa_file_number', 'visa_emirates', 'company_name_in_visa',
      'designation_in_visa', 'contact_number_in_visa', 'visa_emirates_id', 'unified_number',
      'mol_status', 'mol_passport_no', 'mol_expiry_date', 'mol_work_permit_no',
      'salary_in_mol', 'company_name_in_mol', 'traced_source', 'traced_details',
      'sql_details', 'company_trade_license_details', 'additional_details', 'dcore_id'
    ];

    stream
      .pipe(fastcsv.parse())
      .on("data", (data) => {
        // Ensure we have the right number of columns
        if (data.length !== expectedColumns.length) {
          console.warn(`Row has ${data.length} columns, expected ${expectedColumns.length}`);
          // Pad with nulls if too few columns, truncate if too many
          while (data.length < expectedColumns.length) {
            data.push(null);
          }
          data = data.slice(0, expectedColumns.length);
        }
        
        // Validate and truncate VARCHAR(100) fields to prevent data truncation warnings
        const varchar100Fields = [
          1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66
        ];
        
        varchar100Fields.forEach(index => {
          if (data[index] && typeof data[index] === 'string' && data[index].length > 100) {
            console.warn(`Truncating field at index ${index} from ${data[index].length} to 100 characters`);
            data[index] = data[index].substring(0, 100);
          }
        });

        // Handle empty/missing fields by converting them to null
        // This ensures that fields that were present in previous uploads but missing in current upload
        // will be properly cleared instead of retaining old values
        data.forEach((value, index) => {
          if (value === '' || value === undefined || value === 'undefined') {
            data[index] = null;
          }
        });
        
        // Add company_id at the beginning
        data.unshift(company_id);
        
        // Reorder data to match database schema order
        // CSV order after adding company_id (84 total): [company_id, senior_manager_id, team_manager_id, team_lead_id, assigned_to, account_number, product_type, product_account_number, agreement_id, finware_acn01, allocation_status, customer_id, business_name, customer_name, credit_limit, total_outstanding_amount, principal_outstanding_amount, fresh_stab, cycle_statement, bucket_status, card_auth, dpd_r, mindue_manual, rb_amount, overdue_amount, passport_number, date_of_birth, emirates_id_number, due_since_date, vintage, date_of_woff, nationality, mobile_number, email_id, monthly_income, employer_details, designation, company_contact, office_address, home_country_number, friend_residence_phone, minimum_payment, ghrc_offer_1, ghrc_offer_2, ghrc_offer_3, withdraw_date, home_country_address, city, pincode, state, father_name, mother_name, spouse_name, last_paid_amount, last_paid_date, last_month_paid_unpaid, last_usage_date, dpd_string, pli_status, execution_status, banker_name, feedback, contactable_non_contactable, disposition_code, disposition_status_name, visa_status, visa_passport_no, visa_expiry_date, visa_file_number, visa_emirates, company_name_in_visa, designation_in_visa, contact_number_in_visa, visa_emirates_id, unified_number, mol_status, mol_passport_no, mol_expiry_date, mol_work_permit_no, salary_in_mol, company_name_in_mol, traced_source, traced_details, sql_details, company_trade_license_details, additional_details, dcore_id]
        // DB order: [company_id, senior_manager_id, team_manager_id, team_lead_id, assigned_to, account_number, product_type, product_account_number, agreement_id, finware_acn01, business_name, customer_name, allocation_status, customer_id, passport_number, date_of_birth, bucket_status, card_auth, dpd_r, mindue_manual, rb_amount, overdue_amount, vintage, date_of_woff, nationality, emirates_id_number, due_since_date, credit_limit, total_outstanding_amount, principal_outstanding_amount, fresh_stab, cycle_statement, employer_details, designation, company_contact, office_address, home_country_number, friend_residence_phone, mobile_number, email_id, monthly_income, minimum_payment, ghrc_offer_1, ghrc_offer_2, ghrc_offer_3, withdraw_date, home_country_address, city, pincode, state, father_name, mother_name, spouse_name, last_paid_amount, last_paid_date, last_month_paid_unpaid, last_usage_date, dpd_string, pli_status, execution_status, overdue, banker_name, is_uploaded_flag, reason, do_not_follow_flag, feedback, contactable_non_contactable, disposition_status, disposition_status_name, disposition_code, traced_source, traced_details, visa_status, mol_status, contact_info, mol_passport_no, mol_expiry_date, mol_work_permit_no, salary_in_mol, company_name_in_mol, sql_details, company_trade_license_details, additional_details, dcore_id, visa_passport_no, visa_expiry_date, visa_file_number, visa_emirates, company_name_in_visa, designation_in_visa, contact_number_in_visa, visa_emirates_id, unified_number, allocation_type, status, created_id, created_dtm, modified_id, modified_dtm, file_upload_id]
        
        const reorderedData = [
          data[0],  // company_id
          data[1],  // senior_manager_id
          data[2],  // team_manager_id  
          data[3],  // team_lead_id
          data[4],  // assigned_to
          data[5],  // account_number
          data[6],  // product_type
          data[7],  // product_account_number
          data[8],  // agreement_id
          data[9],  // finware_acn01
          data[12], // business_name (SME Account Name)
          data[13], // customer_name (Customer Name)
          data[10], // allocation_status
          data[11], // customer_id (Cust Id - Relationship No)
          data[25], // passport_number
          data[26], // date_of_birth
          data[19], // bucket_status
          data[20], // card_auth
          data[21], // dpd_r
          data[22], // mindue_manual
          data[23], // rb_amount
          data[24], // overdue_amount
          data[29], // vintage
          data[30], // date_of_woff
          data[31], // nationality
          data[27], // emirates_id_number
          data[28], // due_since_date
          data[14], // credit_limit
          data[15], // total_outstanding_amount
          data[16], // principal_outstanding_amount
          data[17], // fresh_stab
          data[18], // cycle_statement
          data[35], // employer_details
          data[36], // designation
          data[37], // company_contact
          data[38], // office_address
          data[39], // home_country_number
          data[40], // friend_residence_phone
          data[32], // mobile_number
          data[33], // email_id
          data[34], // monthly_income
          data[41], // minimum_payment
          data[42], // ghrc_offer_1
          data[43], // ghrc_offer_2
          data[44], // ghrc_offer_3
          data[45], // withdraw_date
          data[46], // home_country_address
          data[47], // city
          data[48], // pincode
          data[49], // state
          data[50], // father_name
          data[51], // mother_name
          data[52], // spouse_name
          data[53] || null, // last_paid_amount - explicitly set to null if missing
          data[54] || null, // last_paid_date - explicitly set to null if missing
          data[55], // last_month_paid_unpaid
          data[56], // last_usage_date
          data[57], // dpd_string
          data[58], // pli_status
          data[59], // execution_status
          data[24], // overdue (use overdue_amount from CSV for overdue field)
          data[60], // banker_name
          'N',      // is_uploaded_flag (default)
          null,     // reason (default)
          do_not_follow_flag || 0, // do_not_follow_flag
          data[61], // feedback
          data[62], // contactable_non_contactable
          data[63], // disposition_status (Disposition Stage from CSV maps to disposition_status)
          data[64], // disposition_status_name
          data[81], // traced_source (Traced Source is column 81)
          data[82], // traced_details (Traced Details is column 82)
          data[65], // visa_status
          data[75], // mol_status
          null,     // contact_info (not in CSV)
          data[76], // mol_passport_no
          data[77], // mol_expiry_date
          data[78], // mol_work_permit_no
          data[79], // salary_in_mol
          data[80], // company_name_in_mol
          data[83], // sql_details (SQL Details is column 83)
          data[84], // company_trade_license_details (Company Trade License Details is column 84)
          data[85], // additional_details (Additional Details is column 85)
          data[86], // dcore_id (DCORE ID is column 86, index 86 after adding company_id)
          data[66], // visa_passport_no (Visa Passport No is column 66)
          data[67], // visa_expiry_date (Visa Expiry date is column 67)
          data[68], // visa_file_number (Visa File Number is column 68)
          data[69], // visa_emirates (Visa Emirates is column 69)
          data[70], // company_name_in_visa (Company Name in Visa is column 70)
          data[71], // designation_in_visa (Designation in Visa is column 71)
          data[72], // contact_number_in_visa (Contact Number in Visa is column 72)
          data[73], // visa_emirates_id (Visa Emirates ID is column 73)
          data[74], // unified_number (Unified Number is column 74)
          allocation_type || null, // allocation_type
          1,        // status (default active)
          user_id,  // created_id
          user_id,  // modified_id
          file_upload_id || null // file_upload_id
        ];
        
        results.push(reorderedData);
      })
      .on("end", async () => {
        try {
          results.shift(); // Remove header row
          console.log("results",results);
          let query = `INSERT INTO stage.lead_stage(
            company_id, senior_manager_id, team_manager_id, team_lead_id, assigned_to, 
            account_number, product_type, product_account_number, agreement_id, finware_acn01,
            business_name, customer_name, allocation_status, customer_id, 
            passport_number, date_of_birth, bucket_status, card_auth, dpd_r, mindue_manual, 
            rb_amount, overdue_amount, vintage, date_of_woff, nationality, emirates_id_number, 
            due_since_date, credit_limit, total_outstanding_amount, principal_outstanding_amount, 
            fresh_stab, cycle_statement, employer_details, designation, company_contact, 
            office_address, home_country_number, friend_residence_phone, mobile_number, 
            email_id, monthly_income, minimum_payment, ghrc_offer_1, ghrc_offer_2, 
            ghrc_offer_3, withdraw_date, home_country_address, city, 
            pincode, state, father_name, mother_name, spouse_name, 
            last_paid_amount, last_paid_date, last_month_paid_unpaid, last_usage_date, 
            dpd_string, pli_status, execution_status, overdue, banker_name, 
            is_uploaded_flag, reason, do_not_follow_flag, feedback, 
            contactable_non_contactable, disposition_status, disposition_status_name, 
            traced_source, traced_details, visa_status, 
            mol_status, contact_info, mol_passport_no, mol_expiry_date, mol_work_permit_no, 
            salary_in_mol, company_name_in_mol, sql_details, company_trade_license_details, 
            additional_details, dcore_id, visa_passport_no, visa_expiry_date, 
            visa_file_number, visa_emirates, company_name_in_visa, designation_in_visa, 
            contact_number_in_visa, visa_emirates_id, unified_number, allocation_type,
            status, created_id, modified_id, file_upload_id
          ) VALUES ?`;


          // console.log('---->', query,[results]);
          const { rows } = await commonController.executeQuery(query, [
            results,
          ]);
          res.json({
            errorCode: 0,
            message: "Staging Completed Successfully",
            data: {
              rows_processed: results.length,
              details: rows,
            },
          });
        } catch (error) {
          console.error("Staging error:", error);
          res.status(500).json({
            errorCode: 1,
            message: "Staging Failed: " + error.message,
            data: error,
          });
        }
      })
      .on("error", (error) => {
        console.error("CSV parsing error:", error);
        res.status(500).json({
          errorCode: 1,
          message: "Error parsing CSV file: " + error.message,
        });
      });
  } catch (error) {
    console.error("Upload leads error:", error);
    res.status(500).json({
      errorCode: 1,
      message: "Error uploading leads: " + error.message,
    });
  }
};

const uploadLeadsFromStageToMainTable = async (req, res) => {
  const { app_user_id, company_id } = req.query;
  let query = `CALL stage.upload_leads(@err,?,?)`;
  let args = [app_user_id, company_id];
  try {
    let { rows } = await commonController.executeQuery(query, args);
    console.log("transfer stage res:::", res);

    res.json({
      errorCode: 0,
      message: `Transfer of Staged Leads Started`,
      data: rows,
    });
  } catch (error) {
    console.error("transfer stage error:::", error);
    res.json({
      errorCode: 1,
      message: `Failed to start transfer staged leads`,
      data: error,
    });
  }
};

const getFailedRecords = async (req, res) => {
  try {
    const { in_company_id, in_start_dtm, in_end_dtm } = req.query;

    if (!in_company_id) {
      return res.status(400).json({
        errorCode: 1,
        message: "Missing required parameter: in_company_id",
      });
    }

    const query = `CALL stage.get_failed_records(@err, ?, ?, ?)`;
    const args = [in_company_id, in_start_dtm, in_end_dtm];

    const { rows } = await commonController.executeQuery(query, args);

    res.status(200).json({
      errorCode: 0,
      message: "Failed Records Retrieved Successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Get failed records error:", error);
    res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch records: " + error.message,
      data: error,
    });
  }
};

const getFailedEntryCountsInStage = async (req, res) => {
  try {
    const { file_upload_id } = req.query;

    // if (!in_company_id) {
    //   return res.status(400).json({
    //     errorCode: 1,
    //     message: "Missing required parameter: in_company_id",
    //   });
    // }

    const query = `CALL stage.get_failed_record_count_by_file_upload_id(@err, ?)`;
    const args = [file_upload_id];

    const { rows } = await commonController.executeQuery(query, args);

    res.status(200).json({
      errorCode: 0,
      message: "Records failed in staging count",
      data: rows[0],
    });
  } catch (error) {
    console.error("Get failed records error:", error);
    res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch records with errors: " + error.message,
      data: error,
    });
  }
};
module.exports = {
  getFailedEntryCountsInStage,
  uploadLeadStageFromCSV,
  uploadLeadsFromStageToMainTable,
  getFailedRecords,
};