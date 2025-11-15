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
    // console.log("req.query",req.query);
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

    stream
      .pipe(fastcsv.parse())
      .on("data", (data) => {
        data.unshift(company_id);
        data.push(
          do_not_follow_flag || 0,
          file_upload_id,
          user_id,
          user_id,
          allocation_type
        );
        results.push(data);
      })
      .on("end", async () => {
        try {
          results.shift(); // Remove header row
          console.log("results",results);
          let query = `INSERT INTO stage.lead_stage(company_id,senior_manager_id,team_manager_id,team_lead_id,assigned_to, account_number,
 product_type, product_account_number, agreement_id, 
business_name, customer_name, allocation_status,
 customer_id, passport_number, date_of_birth, 
bucket_status, card_auth, dpd_r, mindue_manual, rb_amount, overdue_amount, vintage, date_of_woff, nationality, emirates_id_number, due_since_date, credit_limit, 
total_outstanding_amount, principal_outstanding_amount, fresh_stab, cycle_statement, employer_details, designation, company_contact, office_address,
home_country_number, friend_residence_phone, mobile_number, email_id, monthly_income, minimum_payment, ghrc_offer_1, ghrc_offer_2, ghrc_offer_3,	
withdraw_date, home_country_address, city, pincode, state, father_name, mother_name, spouse_name, last_paid_amount, 
last_paid_date, last_month_paid_unpaid, last_usage_date, dpd_string, pli_status,	execution_status, overdue, banker_name,  
feedback,contactable_non_contactable,disposition_status,disposition_status_name,disposition_code,
visa_status,visa_passport_no,visa_expiry_date,visa_file_number,visa_emirates,company_name_in_visa,designation_in_visa,contact_number_in_visa,visa_emirates_id,unified_number,
mol_status,mol_passport_no,mol_expiry_date,mol_work_permit_no,salary_in_mol,company_name_in_mol,traced_source,traced_details,sql_details,company_trade_license_details,
additional_details, dcore_id, do_not_follow_flag,file_upload_id,created_id, modified_id,allocation_type) VALUES ?`;


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
