const commonController = require("../../helpers/common");
var bcrypt = require("bcrypt");
const connection = require("../../config/db");

const getAllContactDeptType = async (req, res) => {
  let query = `select * from org.contact_dept_type`;

  // console.log(query);
  try {
    const { rows } = await commonController.executeQuery(query);
    // console.log("contact-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Contact dept types",
      data: rows,
    });
  } catch (err) {
    console.error("contact-get-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Contact dept types",
      data: err,
    });
  }
};
const getContactById = async (req, res) => {
  // console.log("contact-get-by-user-id", req.query);
  const { contact_id, company_id, contact_dept_type_id } = req.query;
  // const query = `call org.get_org_company(@err, null, null, 1)`
  const query = `CALL org.get_org_contact(@err, ?, ?, ?)`;
  const args = [contact_id, company_id, contact_dept_type_id];

  // console.log(query);
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("getContactById-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Contact",
      data: rows,
    });
  } catch (err) {
    console.error("company-get-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Contact",
      data: err,
    });
  }
};

const createOrgContact = async (req, res) => {
  // console.log("company-post body", req.body);
  const {
    app_user_id,
    company_id,
    contact_dept_type_id,
    contact_mode_list,
    designation,
    salutation,
    first_name,
    last_name,
    email_address,
    phone,
    phone_ext,
    alternate_phone,
  } = req.body;
  // const query = `call org.get_org_company(@err, null, null, 1)`
  const query = `CALL org.create_org_contact(@err, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,@aid)`;
  const args = [
    app_user_id,
    company_id,
    contact_dept_type_id,
    contact_mode_list,
    designation,
    salutation,
    first_name,
    last_name,
    email_address,
    phone,
    phone_ext,
    alternate_phone,
  ];

  // console.log(query);
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("createCompany", rows);
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

const editOrgContact = async (req, res) => {
  // console.log("contact-edit body", req.body);
  const {
    app_user_id,
    contact_id,
    company_id,
    contact_dept_type_id,
    contact_mode_list,
    designation,
    salutation,
    first_name,
    last_name,
    email_address,
    phone,
    phone_ext,
    alternate_phone,
    fax,
  } = req.body;
  const query = `CALL org.edit_org_contact(@err, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,@aid)`;
  const args = [
    app_user_id,
    contact_id,
    company_id,
    contact_dept_type_id,
    contact_mode_list,
    designation,
    salutation,
    first_name,
    last_name,
    email_address,
    phone,
    phone_ext,
    alternate_phone,
    fax,
  ];

  // console.log(args);
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("editContact", rows);
    // if (rows.affectedRows == 1) {
    //   return res.status(200).json({
    //     errorCode: 0,
    //     message: "Your changes have been successfully saved.",
    //     data: rows,
    //   });
    // } else {
    //   return res.status(500).json({
    //     errorCode: 1,
    //     message: "Failed to Save.",
    //     data: rows,
    //   });
    // }
    return res.status(200).json({
      errorCode: 0,
      message: "Your changes have been successfully saved.",
      data: rows,
    });
  } catch (err) {
    console.error("contact-put-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Save.",
      data: err,
    });
  }
};

module.exports = {
  getAllContactDeptType,
  getContactById,
  createOrgContact,
  editOrgContact,
};
