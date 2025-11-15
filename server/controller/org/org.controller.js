const commonController = require("../../helpers/common");
var bcrypt = require("bcrypt");
const connection = require("../../config/db");

//! Get Company
const getAllCompany = async (req, res) => {
    let query = 'select * from org.company';
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
}
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
        // console.error("company-get-err", err);
        return res.status(500).json({
            errorCode: 1,
            message: "Failed to Fetch Company",
            data: err,
        });
    }
};

const createCompany = async (req, res) => {

}


module.exports = { getAllCompany, getCompany };
