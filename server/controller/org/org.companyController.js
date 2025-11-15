const commonController = require("../../helpers/common");
var bcrypt = require("bcrypt");
const connection = require("../../config/db");

//! Get Company
const getAllCompany = async (req, res) => {
  let query = "select * from org.company";
  try {
    const { rows } = await commonController.executeQuery(query);
    // console.log("company-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Company",
      data: rows,
    });
  } catch (err) {
    console.error("company-get-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Company",
      data: err,
    });
  }
};
const getCompany = async (req, res) => {
  // console.log("company-get-by-user-id", req.query);
  const { company_id, company_name, user_id } = req.query;
  // const query = `call org.get_org_company(@err, null, null, 1)`
  const query = `CALL org.get_org_company(@err, ?, ?, ?)`;
  const args = [company_id, company_name, user_id];

  // console.log(query);
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("company-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Company",
      data: rows,
    });
  } catch (err) {
    console.error("company-get-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Company",
      data: err,
    });
  }
};

const createOrgCompany = async (req, res) => {
  // console.log("company-post body", req.body);
  const {
    app_user_id,
    company_type_id,
    company_name,
    company_code,
    company_desc,
    company_logo_url,
    website,
    country,
    region,
    account_no,
    iban_no,
    swift_code,
    senior_manager_id,
    team_manager_id,
    team_lead_id,
  } = req.body;
  const query = `CALL org.create_org_company(@err, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,@aid); SELECT @aid AS company_id;`;
  const args = [
    app_user_id,
    company_type_id,
    company_name,
    company_code,
    company_desc,
    company_logo_url,
    website,
    country,
    region,
    account_no,
    iban_no,
    swift_code,
    senior_manager_id,
    team_manager_id,
    team_lead_id,
  ];

  // console.log(args);
  // try {
  //     const { rows } = await commonController.executeQuery(query, args);
  //     console.log("createCompany", rows);
  //     return res.status(200).json({
  //         errorCode: 0,
  //         message: "Successfully Created Company",
  //         data: rows,
  //     });
  // } catch (err) {
  //     console.error("company-post-err", err);
  //     return res.status(500).json({
  //         errorCode: 1,
  //         message: "Failed to Create Company",
  //         data: err,
  //     });
  // }

  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("createCompany result", rows);

    // Extracting the new company ID from the result
    //  rows.company_id = rows[1][0].company_id;

    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Created Company",
      data: rows,
    });
  } catch (err) {
    console.error("company-post-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Create Company",
      data: err,
    });
  }
};

const getAllCompanyType = async (req, res) => {
  let query = "select * from org.company_type";

  // console.log(query);
  try {
    const { rows } = await commonController.executeQuery(query);
    // console.log("companyType-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Company Type",
      data: rows,
    });
  } catch (err) {
    console.error("company-get-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Company Type",
      data: err,
    });
  }
};

const editOrgCompany = async (req, res) => {
  // console.log("company-edi body", req.body);
  const {
    app_user_id,
    company_id,
    company_type_id,
    company_name,
    company_code,
    company_desc,
    company_logo_url,
    website,
    country,
    region,
    account_no,
    iban_no,
    swift_code,
    senior_manager_id,
    team_manager_id,
    team_lead_id,
    status,
  } = req.body;
  const query = `CALL org.edit_org_company(@err, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  const args = [
    app_user_id,
    company_id,
    company_type_id,
    company_name,
    company_code,
    company_desc,
    company_logo_url,
    website,
    country,
    region,
    account_no,
    iban_no,
    swift_code,
    senior_manager_id,
    team_manager_id,
    team_lead_id,
    status,
  ];

  // console.log(args);
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("editCompany", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Your changes have been successfully saved.",
      data: rows,
    });
  } catch (err) {
    console.error("company-put-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Save.",
      data: err,
    });
  }
};

module.exports = {
  getAllCompany,
  getCompany,
  getAllCompanyType,
  createOrgCompany,
  editOrgCompany,
};
