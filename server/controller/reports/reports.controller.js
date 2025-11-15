const commonController = require("../../helpers/common");

const generateDailyReportForAgents = async (req, res) => {
  const {
    app_user_id,
    lead_id,
    agent_id,
    company_id,
    start_dtm,
    end_dtm,
    to_dtm,
    stage,
    stage_status_code,
    contact_mode_list,
    report_name,
  } = req.query;

  let offsetStartDate = new Date(start_dtm)
    .toLocaleString("en-CA", {
      timeZone: "Asia/Kolkata",
    })
    .split(",")[0];

  let offsetEndDate = new Date(to_dtm)
    .toLocaleString("en-CA", {
      timeZone: "Asia/Kolkata",
    })
    .split(",")[0];

  const query = `CALL report.get_account_report_by_agent (@err,?,?,?,?,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    lead_id,
    agent_id,
    company_id,
    offsetStartDate,
    offsetEndDate,
    stage,
    stage_status_code,
    contact_mode_list,
    report_name,
  ];
  // console.log(
  //   "get-daily-report-query:::>>>",
  //   query,
  //   "get-daily-report-args:::>>>",
  //   args
  // );
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("gen-daily-report-res::>:>", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Generated Daily Report",
      data: rows,
    });
  } catch (err) {
    console.error("gen-daily-report-err::>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to generate daily report",
      data: err,
    });
  }
};

const generateContactedNCReports = async (req, res) => {
  const {
    app_user_id,
    lead_id,
    agent_id,
    company_id,
    start_dtm,
    end_dtm,
    to_dtm,
    stage,
    stage_status_code,
    contact_mode_list,
  } = req.query;

  //console.log("CNC-report-params:::>>>", req.query);

  let offsetStartDate = new Date(start_dtm)
    .toLocaleString("en-CA", {
      timeZone: "Asia/Kolkata",
    })
    .split(",")[0];

  let offsetEndDate = new Date(to_dtm)
    .toLocaleString("en-CA", {
      timeZone: "Asia/Kolkata",
    })
    .split(",")[0];

  const query = `CALL report.get_account_report_by_agent (@err,?,?,?,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    lead_id,
    agent_id,
    company_id,
    offsetStartDate,
    offsetEndDate,
    stage,
    stage_status_code,
    contact_mode_list,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    ////console.log("gen-cnc-report-res::>:>", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Generated Contacted / Non-Contacted Report",
      data: rows,
    });
  } catch (err) {
    console.error("gen-cnc-report-err::>", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to generate contacted / non-contacted report",
      data: err,
    });
  }
};

module.exports = { generateDailyReportForAgents, generateContactedNCReports };
