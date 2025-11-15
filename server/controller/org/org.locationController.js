const commonController = require("../../helpers/common");
var bcrypt = require("bcrypt");
const connection = require("../../config/db");

const getAllAddressType = async (req, res) => {
  let query = `select * from org.address_type`;

  // console.log(query);
  try {
    const { rows } = await commonController.executeQuery(query);
    // console.log("address-types-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Address Types",
      data: rows,
    });
  } catch (err) {
    console.error("contact-get-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Address Types",
      data: err,
    });
  }
};

const getLocationById = async (req, res) => {
  // console.log("contact-get-by-user-id", req.query);
  const { company_id, location_id, address_id, address_type_id } = req.query;
  // const query = `call org.get_org_company(@err, null, null, 1)`
  const query = `CALL org.get_org_location(@err, ?, ?, ?, ?)`;
  const args = [company_id, location_id, address_id, address_type_id];

  // console.log(query);
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("getLocationById-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Location.",
      data: rows,
    });
  } catch (err) {
    console.error("company-get-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Location",
      data: err,
    });
  }
};

const getAllLocationType = async (req, res) => {
  let query = `select * from org.location_type`;

  // console.log(query);
  try {
    const { rows } = await commonController.executeQuery(query);
    // console.log("contact-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Location types",
      data: rows,
    });
  } catch (err) {
    console.error("contact-get-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Location types",
      data: err,
    });
  }
};

const createOrgLocation = async (req, res) => {
  // console.log("createOrgLocation", req.body);
  const {
    app_user_id,
    company_id,
    location_type_id,
    location_name,
    location_code,
    address_name,
    address_line_1,
    address_line_2,
    address_line_3,
    city,
    state,
    country,
    zipcode,
    address_type_id,
  } = req.body;
  // const query = `call org.get_org_company(@err, null, null, 1)`
  const query = `CALL org.create_org_location(@err, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?,@aid)`;
  const args = [
    app_user_id,
    company_id,
    location_type_id,
    location_name,
    location_code,
    address_name,
    address_line_1,
    address_line_2,
    address_line_3,
    city,
    state,
    country,
    zipcode,
    address_type_id,
  ];

  // console.log(query);
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("createOrgLocation", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Created Location",
      data: rows,
    });
  } catch (err) {
    console.error("company-post-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Create Loaction",
      data: err,
    });
  }
};

const editOrgLocation = async (req, res) => {
  // console.log("editOrgLocation", req.body);
  const {
    app_user_id,
    company_id,
    location_type_id,
    location_name,
    location_code,
    address_type_id,
    address_name,
    address_line_1,
    address_line_2,
    address_line_3,
    city,
    state,
    country,
    zipcode,
    status,
  } = req.body;
  const query = `CALL org.upsert_org_location(@err, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?,@aid)`;
  const args = [
    app_user_id,
    company_id,
    location_type_id,
    location_name,
    location_code,
    address_type_id,
    address_name,
    address_line_1,
    address_line_2,
    address_line_3,
    city,
    state,
    country,
    zipcode,
    status,
  ];
  // console.log("length", args.length);

  // console.log(query);
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("editOrgLocation", rows);
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
    console.error("company-post-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Save.",
      data: err,
    });
  }
};

module.exports = {
  getAllLocationType,
  createOrgLocation,
  getAllAddressType,
  getLocationById,
  editOrgLocation,
};
