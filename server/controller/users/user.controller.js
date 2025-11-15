const commonController = require("../../helpers/common");
const connection = require("../../config/db");
const pwd = require("../../middleware/password-bcrypt");
const auth = require("../../middleware/jwt");
const { mac } = require("address");
const { sendEmail } = require("../email-service");

// Flag to prevent multiple email sends for the same user (with timestamp)
let emailSentForUser = null;
let emailSentTimestamp = null;

//! Create User
const createUser = async (req, res) => {
  const {
    app_user_id,
    designation,
    first_name,
    last_name,
    email_id,
    password,
    phone,
    mac_address,
    allowed_ip,
    is_admin,
    image_url,
    reporting_to_id,
    country,
    state,
    city,
    token,
  } = req.body;

  // Hash the password using bcrypt before storing it
  const hashedPassword = await pwd.hashPassword(password);

  const query = `CALL user.create_user(@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@aid); SELECT @aid AS user_id;`;

  const args = [
    app_user_id,
    designation,
    first_name,
    last_name,
    email_id,
    hashedPassword, // Use the hashed password instead of the plain one
    phone,
    mac_address,
    allowed_ip,
    is_admin,
    image_url,
    reporting_to_id,
    country,
    state,
    city,
    token,
  ];

  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("signup-res", rows);
    return res
      .status(200)
      .json({ errorCode: 0, message: "Successfully Created User", data: rows });
  } catch (err) {
    console.error("signup-err", err);
    return res
      .status(500)
      .json({ errorCode: 1, message: "Failed to create user", data: err });
  }
};

//!Create User Activity
const createUserActivity = async (req, res) => {
  const {
    app_user_id,
    activity_type,
    activity_doc_pk_id,
    activity_doc_num,
    activity_detail,
    activity_dtm,
  } = req.body;
  const query = `CALL user.create_user_activity_log(@err,?,?,?,?,?,?,@osuid);`;
  const args = [
    app_user_id,
    activity_type,
    activity_doc_pk_id,
    activity_doc_num,
    activity_detail,
    activity_dtm,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("usr-activity-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Created User Activity",
      data: rows,
    });
  } catch (err) {
    console.error("usr-activity-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to create user activity",
      data: err,
    });
  }
};

//! Create User Notification
const createUserNotification = async (req, res) => {
  const {
    user_id,
    notification_type_id,
    notification_name,
    notification_message,
    notification_effective_from,
    notification_effective_to,
    notification_lifespan_days,
    notification_publish_flag,
    acknowledgment_required,
    notification_acknowledged_on,
    app_user_id,
  } = req.body;
  // const query = `CALL user.create_user_notification(@err,2,16,'APPROVE ORDER # 1234','MSG - APPROVE ORDER # 1234','2020-05-18','2020-05-19',4,1,1,NULL,2,@out_id)`;
  const query = `CALL user.create_user_notification(@err,?,?,?,?,?,?,?,?,?,?,?,@out_id);`;
  const args = [
    user_id,
    notification_type_id,
    notification_name,
    notification_message,
    notification_effective_from,
    notification_effective_to,
    notification_lifespan_days,
    notification_publish_flag,
    acknowledgment_required,
    notification_acknowledged_on,
    app_user_id,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("usr-activity-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Notification sent to user",
      data: rows,
    });
  } catch (err) {
    console.error("usr-activity-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to send notification to user",
      data: err,
    });
  }
};

//! Create User Preferences
const createUserPreferences = async (req, res) => {
  const {
    app_user_id,
    user_id,
    preferred_module_ids,
    preferred_notification_type_ids,
  } = req.body;
  // const query = `CALL user.create_user_preference(@err, 2, 7, '1,2,3,4,5', '14,15,16,22,32,33', @upid)`;
  const query = `CALL user.create_user_preference(@err,?,?,?,?,@upid)`;
  const args = [
    app_user_id,
    user_id,
    preferred_module_ids,
    preferred_notification_type_ids,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("usr-preferences-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Created User Preferences",
      data: rows,
    });
  } catch (err) {
    console.error("usr-preferences-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to create user preferences",
      data: err,
    });
  }
};

//! Create User Template Action Log
const createUserTemplateActionLog = async (req, res) => {
  const {
    app_user_id,
    user_template_docs_id,
    user_id,
    user_template_data_doc,
    action_dtm,
    action_by_id,
  } = req.body;
  // const query = `CALL user.create_user_template_data_doc(@err,0,2,3,'blob','2019-11-11','55555',@oacid)`;
  const query = `CALL user.create_user_preference(@err,?,?,?,?,?,?,@oacid)`;
  const args = [
    app_user_id,
    user_template_docs_id,
    user_id,
    user_template_data_doc,
    action_dtm,
    action_by_id,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("usr-temp-action-log-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Created User Template Action Log",
      data: rows,
    });
  } catch (err) {
    console.error("usr-temp-action-log-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to create user template action log",
      data: err,
    });
  }
};

//! Delete User Role Company
const deleteUserRoleCompany = async (req, res) => {
  const { app_user_id, user_role_company_id } = req.body;
  // const query = `CALL user.delete_user_role_company(@err, -2, 3)`;
  const query = `CALL user.delete_user_role_company(@err,?,?)`;
  const args = [app_user_id, user_role_company_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("usr-preferences-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Deleted User Role Company",
      data: rows,
    });
  } catch (err) {
    console.error("usr-preferences-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to deleted user role company",
      data: err,
    });
  }
};

//! Edit User Notification
const editUserNotification = async (req, res) => {
  const {
    app_user_id,
    user_notification_id,
    notification_type_id,
    notification_name,
    notification_message,
    notification_effective_from,
    notification_effective_to,
    notification_lifespan_days,
    notification_publish_flag,
    acknowledgment_required,
    notification_acknowledged_on,
    status,
  } = req.body;
  // const query = `CALL user.edit_user_notification(@err,2,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,CURRENT_TIMESTAMP,0)`;
  const query = `CALL user.edit_user_notification(@err,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    user_notification_id,
    notification_type_id,
    notification_name,
    notification_message,
    notification_effective_from,
    notification_effective_to,
    notification_lifespan_days,
    notification_publish_flag,
    acknowledgment_required,
    notification_acknowledged_on,
    status,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("usr-edit-notif-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Edited User Notification",
      data: rows,
    });
  } catch (err) {
    console.error("usr-edit-notif-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Edit User Notification",
      data: err,
    });
  }
};

//! Edit User Preferences
const editUserPreferences = async (req, res) => {
  const {
    app_user_id,
    user_preference_id,
    user_id,
    preferred_module_ids,
    preferred_notification_type_ids,
    status,
  } = req.body;
  // const query = `CALL user.edit_user_preference (@err, 2,1,5,'1,2,3,4,5', '6,7,8,9',1)`;
  const query = `CALL user.edit_user_preference(@err,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    user_preference_id,
    user_id,
    preferred_module_ids,
    preferred_notification_type_ids,
    status,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("usr-edit-preferences-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Edited User Preferences",
      data: rows,
    });
  } catch (err) {
    console.error("usr-edit-preferences-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Edit User Preferences",
      data: err,
    });
  }
};

//! Edit User Role Company
const editUserRoleCompany = async (req, res) => {
  const {
    user_role_company_id,
    user_id,
    role_id,
    company_id,
    status,
    modified_id,
  } = req.body;
  // const query = `CALL user.edit_user_role_company(@err,3,null,null,44,null,null)`;
  const query = `CALL user.edit_user_role_company(@err,?,?,?,?,?,?)`;
  const args = [
    user_role_company_id,
    user_id,
    role_id,
    company_id,
    status,
    modified_id,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("usr-edit-urc-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Edited User Role Company",
      data: rows,
    });
  } catch (err) {
    console.error("usr-edit-urc-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Edit User Role Company",
      data: err,
    });
  }
};

//! Edit User
//! Get IT Manager Details
const getITManagerDetails = async (req, res) => {
  const query = `
    SELECT u.user_id, u.first_name, u.last_name, u.email_address, r.role_name
    FROM user.user u
    INNER JOIN user.user_role_company urc ON u.user_id = urc.user_id
    INNER JOIN user.role r ON urc.role_id = r.role_id
    WHERE r.role_name = 'IT MANAGER' AND u.status = 1
  `;
  
  try {
    const { rows } = await commonController.executeQuery(query, []);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched IT manager details",
      data: rows || [],
    });
  } catch (err) {
    console.error("Error fetching IT manager details:", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch IT manager details",
      data: err,
    });
  }
};

//! Get IT Manager Details (Internal function for email service)
const getITManagerDetailsInternal = async () => {
  const query = `
    SELECT u.user_id, u.first_name, u.last_name, u.email_address, r.role_name
    FROM user.user u
    INNER JOIN user.user_role_company urc ON u.user_id = urc.user_id
    INNER JOIN user.role r ON urc.role_id = r.role_id
    WHERE r.role_name = 'IT MANAGER' AND u.status = 1
  `;
  
  try {
    const { rows } = await commonController.executeQuery(query, []);
    return rows || [];
  } catch (err) {
    console.error("Error fetching IT manager details:", err);
    return [];
  }
};

//! Send User Deletion Email to IT Managers
const sendUserDeletionEmail = async (deletedUser, itManagers) => {
  if (!itManagers || itManagers.length === 0) {
    console.log("No IT managers found, skipping email notification");
    return;
  }

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">User Deletion Notification</h2>
      <p>Hi IT Team,</p>
      <p>Below user has been deactivated/ deleted from the platform:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>User ID:</strong> ${deletedUser.user_id}</p>
        <p><strong>User Name:</strong> ${deletedUser.first_name} ${deletedUser.last_name}</p>
        <p><strong>Role:</strong> ${deletedUser.role || 'Not Assigned'}</p>
      </div>
      <p>Thank you,<br>Team Sunshine Solutions Pvt. Ltd.</p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">
        This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email. 
        For questions or assistance, please get in touch with info@mailers.codeswift.in.
      </p>
    </div>
  `;

  // Extract all IT manager email addresses
  const itManagerEmails = itManagers.map(manager => manager.email_address);
  
  // Send one email to all IT managers
  const emailPayload = {
    to: itManagerEmails.join(','), // Join all emails with comma for multiple recipients
    subject: "User Deletion Notification - Sunshine CRM",
    emailBody: emailBody
  };

  try {
    const mockReq = { body: emailPayload };
    const mockRes = { 
      send: (data) => console.log("Email sent successfully to all IT managers"),
      status: (code) => ({ send: (data) => console.log("Email sent successfully to all IT managers") })
    };
    
    await sendEmail(mockReq, mockRes);
    console.log("User deletion email sent to all IT managers:", itManagerEmails);
  } catch (err) {
    console.error("Error sending user deletion email to IT managers:", err);
  }
};

const editUser = async (req, res) => {
  const {
    app_user_id,
    user_id,
    designation,
    first_name,
    last_name,
    email_address,
    password,
    phone,
    otp,
    mac_address,
    allowed_ip,
    last_login,
    last_login_ip_address,
    is_admin,
    image_url,
    reporting_to_id,
    country,
    state,
    city,
    token,
    status,
  } = req.body;
  
  const query = `CALL user.edit_user(@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    user_id,
    designation,
    first_name,
    last_name,
    email_address,
    password,
    phone,
    otp,
    mac_address,
    allowed_ip,
    last_login,
    last_login_ip_address,
    is_admin,
    image_url,
    reporting_to_id,
    country,
    state,
    city,
    token,
    status,
  ];
  
  try {
    const { rows } = await commonController.executeQuery(query, args);
    
    // Check if user is being deactivated (status = 0)
    if (status === 0) {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes
      
      // Prevent multiple emails for the same user within 5 minutes
      if (emailSentForUser === user_id && emailSentTimestamp && (now - emailSentTimestamp < fiveMinutes)) {
        console.log(`Email already sent for user ${user_id} within 5 minutes, skipping`);
        return res.status(200).json({
          errorCode: 0,
          message: "Successfully Edited User",
          data: rows,
        });
      }
      
      // Get user role information
      const userRoleQuery = `
        SELECT r.role_name 
        FROM user.user_role_company urc
        INNER JOIN user.role r ON urc.role_id = r.role_id
        WHERE urc.user_id = ? AND urc.status = 1
        LIMIT 1
      `;
      
      let userRole = 'Not Assigned';
      try {
        const roleResult = await commonController.executeQuery(userRoleQuery, [user_id]);
        if (roleResult.rows && roleResult.rows[0]) {
          userRole = roleResult.rows[0].role_name;
        }
      } catch (roleErr) {
        console.error("Error fetching user role:", roleErr);
      }
      
      const deletedUser = {
        user_id,
        first_name,
        last_name,
        role: userRole
      };
      
      // Get IT manager details and send email
      const itManagers = await getITManagerDetailsInternal();
      await sendUserDeletionEmail(deletedUser, itManagers);
      
      // Set flag to prevent duplicate emails
      emailSentForUser = user_id;
      emailSentTimestamp = now;
    }
    
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Edited User",
      data: rows,
    });
  } catch (err) {
    console.error("usr-edit-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Edit User",
      data: err,
    });
  }
};

//! Get Group Assignee List
const getGroupAssigneeList = async (req, res) => {
  const { user_id, group_name } = req.body;
  // const query = `CALL user.get_group_assignee_list(@err,1,'ACCOUNTS-ORDERS')`;
  const query = `CALL user.get_group_assignee_list(@err,?,?)`;
  const args = [user_id, group_name];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("usr-get-assignee-list-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched User Assignee List",
      data: rows,
    });
  } catch (err) {
    console.error("usr-get-assignee-list-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetched User Assignee List",
      data: err,
    });
  }
};

//! Get Module Approver List
const getModuleApproverList = async (req, res) => {
  const { app_user_id, user_id, module_name } = req.body;
  // const query = `CALL user.get_module_approver_list(@err,2, 3,'ACCOUNTS-ORDERS')`;
  const query = `CALL user.get_module_approver_list(@err,?,?,?)`;
  const args = [app_user_id, user_id, module_name];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("usr-get-module-approver-list-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Module Approver List",
      data: rows,
    });
  } catch (err) {
    console.error("usr-get-module-approver-list-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetched Module Approver List",
      data: err,
    });
  }
};

//! Get Modules
const getModules = async (req, res) => {
  const { module_id, module_name } = req.body;
  // const query = `CALL user.get_module(@err,1,null)`;
  const query = `CALL user.get_module(@err,?,?)`;
  const args = [module_id, module_name];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // //console.log("get-module-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Modules",
      data: rows,
    });
  } catch (err) {
    // console.error("get-module-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetched Modules",
      data: err,
    });
  }
};

//! Get Notification Type
const getNotificationType = async (req, res) => {
  const {
    notification_type_id,
    company_id,
    module_id,
    notification_type_name,
  } = req.query;
  // const query = `CALL user.get_notification_type(@err,null,null,null,NULL)`;
  const query = `CALL user.get_notification_type(@err,?,?,?,?)`;
  const args = [
    notification_type_id,
    company_id,
    module_id,
    notification_type_name,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-notification-type-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Notification Type",
      data: rows,
    });
  } catch (err) {
    console.error("get-notification-type-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Notification Type",
      data: err,
    });
  }
};

//! Get Privilege
const getPrivilege = async (req, res) => {
  const { privilege_id, privilege_name } = req.body;
  // const query = `CALL user.get_privilege(@err,1,null)`;
  const query = `CALL user.get_privilege(@err,?,?)`;
  const args = [privilege_id, privilege_name];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-Privilege-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Privileges",
      data: rows,
    });
  } catch (err) {
    console.error("get-notification-type-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Privileges",
      data: err,
    });
  }
};

//! Get Role
const getRole = async (req, res) => {
  const { role_id, role_name } = req.query;
  // const query = `CALL user.get_role(@err,1,null)`;
  const query = `CALL user.get_role(@err,?,?)`;
  const args = [role_id, role_name];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-role-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched Roles",
      data: rows,
    });
  } catch (err) {
    console.error("get-role-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch Roles",
      data: err,
    });
  }
};

//! Get User Dashboard Count
const getUserDashboardCount = async (req, res) => {
  const { user_id } = req.body;
  // const query = `CALL user.get_user_dashboard_count(@err,4)`;
  const query = `CALL user.get_user_dashboard_count(@err,?)`;
  const args = [user_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-user-dashboard-count-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched User Dashboard Count",
      data: rows,
    });
  } catch (err) {
    console.error("get-user-dashboard-count-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch User Dashboard Count",
      data: err,
    });
  }
};

//! Get User Notification
const getUserNotification = async (req, res) => {
  const {
    app_user_id,
    user_notification_id,
    notification_type_id,
    notification_effective_from,
    notification_effective_to,
    notification_acknowledged_on,
    is_notification_acknowledged,
  } = req.query;
  // const query = `CALL user.get_user_notification(@err,2,2,null,null,null,null)`;
  const query = `CALL user.get_user_notification(@err,?,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    user_notification_id,
    notification_type_id,
    notification_effective_from,
    notification_effective_to,
    notification_acknowledged_on,
    is_notification_acknowledged,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-user-notif-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched User Notifications",
      data: rows,
    });
  } catch (err) {
    console.error("get-user-notif-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch User Notifications",
      data: err,
    });
  }
};

//! Get User Preferences
const getUserPreference = async (req, res) => {
  const { user_preference_id, user_id } = req.body;
  // const query = `CALL user.get_user_preference(@err,null,null)`;
  const query = `CALL user.get_user_preference(@err,?,?)`;
  const args = [user_preference_id, user_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-user-pref-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched User Preferences",
      data: rows,
    });
  } catch (err) {
    console.error("get-user-pref-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch User Preferences",
      data: err,
    });
  }
};

//! Get User Preferred Notification Type
const getUserPreferredNotifType = async (req, res) => {
  const { user_id } = req.body;
  // const query = `CALL user.get_user_preferred_notification_type(@err,2)`;
  const query = `CALL user.get_user_preferred_notification_type(@err,?)`;
  const args = [user_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-user-notif-pref-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched User Preferred Notification Type",
      data: rows,
    });
  } catch (err) {
    console.error("get-user-notif-pref-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch User Preferred Notification Type",
      data: err,
    });
  }
};

//! Get User Role Company
const getUserRoleCompany = async (req, res) => {
  const { user_role_company_id, user_id, role_id, company_id } = req.query;
  // //console.log("urc-reqbody", req.body || "req-query", req.query);
  // const query = `CALL user.get_user_role_company(@err,1,null,null,null)`;
  const query = `CALL user.get_user_role_company(@err,?,?,?,?)`;
  const args = [user_role_company_id, user_id, role_id, company_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-user-role-company-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched User Role Company",
      data: rows,
    });
  } catch (err) {
    console.error("get-user-role-company-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch User Role Company",
      data: err,
    });
  }
};

//! Get User Template Action Log
const getUserTemplateActionLog = async (req, res) => {
  const { user_template_docs_id, user_id } = req.body;
  // const query = `CALL user.get_user_template_action_log(@err,1,null)`;
  const query = `CALL user.get_user_template_action_log(@err,?,?)`;
  const args = [user_template_docs_id, user_id];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-user-temp-action-log-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched User Template Action Log",
      data: rows,
    });
  } catch (err) {
    console.error("get-user-temp-action-log-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch User Template Action Log",
      data: err,
    });
  }
};

//! Get User Template Docs
const getUserTemplateDocs = async (req, res) => {
  const { user_template_type_name } = req.body;
  // const query = `CALL user.get_user_template_docs(@err,'wlc_email_to_user')`;
  const query = `CALL user.get_user_template_docs(@err,?)`;
  const args = [user_template_type_name];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // //console.log("get-user-temp-docs-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched User Template Docs",
      data: rows,
    });
  } catch (err) {
    // console.error("get-user-temp-docs-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch User Template Docs",
      data: err,
    });
  }
};

//! Get User
const getUser = async (req, res) => {
  const {
    user_id,
    first_name,
    last_name,
    email_address,
    phone,
    mac_address,
    token,
    status,
  } = req.query || req.body;

  //console.log("req.query:::", req.query);
  const query = `CALL user.get_user(@err,?,?,?,?,?,?,?,?)`;
  const args = [
    user_id,
    first_name,
    last_name,
    email_address,
    phone,
    mac_address,
    token,
    status,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("get-user-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched User",
      data: rows,
    });
  } catch (err) {
    // console.error("get-user-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Fetch User",
      data: err,
    });
  }
};

const forgotPassword = async (req, res) => {
  const {
    user_id,
    first_name,
    last_name,
    email_address,
    phone,
    mac_address,
    token,
    status,
  } = req.query;

  // console.log("req.query:::", req.query);
  const query = `CALL user.get_user(@err,?,?,?,?,?,?,?,?)`;
  const args = [
    user_id,
    first_name,
    last_name,
    email_address,
    phone,
    mac_address,
    token,
    status,
  ];

  try {
    const { rows } = await commonController.executeQuery(query, args);

    // console.log("get-user-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Fetched User",
      data: rows,
    });
  } catch (err) {
    // console.error("get-user-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: `Failed to find user with ${req.query.email_address}`,
      data: err,
    });
  }
};

const forgotPasswordGenJWT = async (req, res) => {
  //console.log("gen-tkn", req.body);
  let reqBody = req.body;
  try {
    const token = auth.generateJWTToken(reqBody);
    //console.log("fp:token:::", token);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully sent token for forgot password",
      data: token,
    });
  } catch (err) {
    // console.error("get-user-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: `Failed to find user with ${req.query.email_address}`,
      data: err,
    });
  }
};

const resetPassword = async (req, res) => {
  // const {
  //   app_user_id,
  //   designation,
  //   first_name,
  //   last_name,
  //   email_id,
  //   password,
  //   phone,
  //   mac_address,
  //   allowed_ip,
  //   is_admin,
  //   image_url,
  //   reporting_to_id,
  //   country,
  //   state,
  //   city,
  //   token,
  // } = req.body;

  // // Hash the password using bcrypt before storing it
  // const hashedPassword = await pwd.hashPassword(password);

  // const query = `CALL user.edit_user(@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@aid); SELECT @aid AS user_id;`;

  // const args = [
  //   app_user_id,
  //   designation,
  //   first_name,
  //   last_name,
  //   email_id,
  //   hashedPassword, // Use the hashed password instead of the plain one
  //   phone,
  //   mac_address,
  //   allowed_ip,
  //   is_admin,
  //   image_url,
  //   reporting_to_id,
  //   country,
  //   state,
  //   city,
  //   token,
  // ];

  const {
    app_user_id,
    user_id,
    designation,
    first_name,
    last_name,
    email_address,
    password,
    phone,
    otp,
    mac_address,
    allowed_ip,
    last_login,
    last_login_ip_address,
    is_admin,
    image_url,
    reporting_to_id,
    country,
    state,
    city,
    token,
    status,
  } = req.body;

  const hashedPassword = await pwd.hashPassword(password);
  const query = `CALL user.edit_user(@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  // const query = `CALL user.edit_user(@err,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    user_id,
    designation,
    first_name,
    last_name,
    email_address,
    hashedPassword,
    phone,
    otp,
    mac_address,
    allowed_ip,
    last_login,
    last_login_ip_address,
    is_admin,
    image_url,
    reporting_to_id,
    country,
    state,
    city,
    token,
    status,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("reset-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Reset Password",
      data: rows,
    });
  } catch (err) {
    console.error("reset-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to reset passowrd",
      data: err,
    });
  }
};

//! Grant Role Module Privileges
const grantRoleModulePrivileges = async (req, res) => {
  const {
    app_user_id,
    email_address,
    role_name,
    company_code,
    module_name_list,
    group_list,
  } = req.body;
  // const query = `CALL user.grant_role_module_privilege(@err,2,"soumyasourabha.608@gmail.com","DEPARTMENT USER","TLP","ACCOUNTS-ORDERS,ACCOUNTS-INVOICE","BEDDING-MANAGERS,BATH-MANAGERS",@ourc)`;
  const query = `CALL user.grant_role_module_privilege(@err,?,?,?,?,?,?)`;
  const args = [
    app_user_id,
    email_address,
    role_name,
    company_code,
    module_name_list,
    group_list,
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("grant-role-module-privilege-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Granted Role Module Privilege",
      data: rows,
    });
  } catch (err) {
    console.error("grant-role-module-privilege-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Granted Role Module Privilege",
      data: err,
    });
  }
};

//! Login
const login = async (req, res) => {
  const { user_email, password, mac_address, allowed_ip } = req.body;
  const query = `CALL user.login (@err, ?, ?, ?, ?)`;
  const args = [user_email, password, mac_address, allowed_ip];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    const token = auth.generateJWTToken(rows[0][0]);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully Logged In",
      data: rows,
      token: token,
    });
  } catch (err) {
    console.error("login-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Login",
      data: err,
    });
  }
};

//! Login v1 endpoint without mac address validation
const loginV1 = async (req, res) => {
  const {
    user_id,
    first_name,
    last_name,
    email_address,
    phone,
    mac_address,
    password,
    token,
    status,
  } = req.body;

  //console.log(req.body);

  if (!password) {
    return res.status(400).json({
      errorCode: 1,
      message: "Password is required",
    });
  }

  const query = `call user.get_user(@err,?,?,?,?,?,?,?,?)`;
  const args = [
    user_id,
    first_name,
    last_name,
    email_address,
    phone,
    mac_address,
    token,
    status,
  ];

  try {
    const { rows } = await commonController.executeQuery(query, args);

    if (!rows[0] || !rows[0][0]) {
      return res.status(404).json({
        errorCode: 1,
        message: "User not found",
      });
    }

    const dbPassword = rows[0][0].password;
    const isMatch = await pwd.comparePassword(password, dbPassword);

    if (!isMatch) {
      return res.status(401).json({
        errorCode: 1,
        message: "Invalid Email / Password",
      });
    }

    const user = rows[0][0];
    const token = auth.generateJWTToken(user);

    // Log the login activity
    try {
      const activityQuery = `CALL user.create_user_activity_log(@err,?,?,?,?,?,?,@osuid);`;
      const activityArgs = [
        user.user_id,           // app_user_id
        'USER_LOGIN',          // activity_type
        user.user_id,          // activity_doc_pk_id
        user.user_id,          // activity_doc_num
        new Date().toISOString(), // activity_detail (current timestamp)
        new Date()             // activity_dtm
      ];
      
      await commonController.executeQuery(activityQuery, activityArgs);
      console.log(`Login activity logged for user ${user.user_id}`);
    } catch (activityErr) {
      console.error("Failed to log login activity:", activityErr);
      // Don't fail the login if activity logging fails
    }

    return res.status(200).json({
      errorCode: 0,
      message: "Login successful",
      token: token,
      data: {
        user_id: user.user_id,
        role_name: user.role_name,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        email_address: user.email_address,
        image_url: user.image_url,
      },
    });
  } catch (err) {
    console.error("login-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to log in",
      data: err,
    });
  }
};

//! Login v1 endpoint with mac address validation (not-working for deployed version)
// const loginV1 = async (req, res) => {
//   const {
//     user_id,
//     first_name,
//     last_name,
//     email_address,
//     phone,
//     mac_address,
//     password,
//     token,
//     status,
//   } = req.body;

//   console.log(req.body);

//   if (!password) {
//     return res.status(400).json({
//       errorCode: 1,
//       message: "Password is required",
//     });
//   }

//   const query = `call user.get_user(@err,?,?,?,?,?,?,?,?,?)`;
//   const args = [
//     user_id,
//     first_name,
//     last_name,
//     email_address,
//     phone,
//     mac_address,
//     token,
//     status,
//   ];

//   try {
//     const { rows } = await commonController.executeQuery(query, args);

//     if (!rows[0] || !rows[0][0]) {
//       return res.status(404).json({
//         errorCode: 1,
//         message: "User not found for entered crendentials / Invalid MAC Address",
//       });
//     }

//     const user = rows[0][0];
//     const dbPassword = user.password;

//     // Validate password
//     const isMatch = await pwd.comparePassword(password, dbPassword);
//     if (!isMatch) {
//       return res.status(401).json({
//         errorCode: 1,
//         message: "Invalid Email / Password",
//       });
//     }

//     // Validate MAC address
//     if (user.mac_address !== mac_address) {
//       return res.status(401).json({
//         errorCode: 1,
//         message: "MAC address does not match",
//       });
//     }

//     const token = auth.generateJWTToken(user);

//     return res.status(200).json({
//       errorCode: 0,
//       message: "Login successful",
//       token: token,
//       data: {
//         user_id: user.user_id,
//         role_name: user.role_name,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         full_name: user.full_name,
//         email_address: user.email_address,
//         image_url: user.image_url,
//       },
//     });
//   } catch (err) {
//     console.error("login-err", err);
//     return res.status(500).json({
//       errorCode: 1,
//       message: "Failed to log in",
//       data: err,
//     });
//   }
// };

const getMac = async (req, res) => {
  // let reqBody = req.body;
  // console.log(reqBody.ip);
  try {
    mac(function (err, addr) {
      //console.log(addr);
      return res.status(200).json({
        errorCode: 0,
        message: "Device MAC Found",
        macAddress: addr,
      });
    });
  } catch (error) {
    return res.status(500).json({
      errorCode: 1,
      message: `Falied to obtain device MAC`,
      errorMessage: error,
    });
  }
};

//! Set Auto Notification Acknowledge
const setAutoNotifAck = async (req, res) => {
  const { user_id, notification_type_id, notification_name } = req.body;
  // const query = `CALL user.set_auto_notification_acknowledge(4,17,"ORD-PAS-WH/455/20-21")`;
  const query = `CALL user.set_auto_notification_acknowledge (?, ?, ?)`;
  const args = [user_id, notification_type_id, notification_name];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("setAutoNotifAck-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Setting Auto Notification Successful",
      data: rows,
    });
  } catch (err) {
    console.error("setAutoNotifAck-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Set Auto Notification",
      data: err,
    });
  }
};

//! Upsert User Role Company
const upsertUserRoleCompany = async (req, res) => {
  const {
    app_user_id,
    user_id,
    role_id,
    company_id,
    module_id,
    privilege_list,
    group_list,
    status,
    is_role_only_update
  } = req.body;
  const query = `CALL user.upsert_user_role_company (@err,?,?,?,?,?,?,?,?,?,@ourc)`;
  const args = [
    app_user_id,
    user_id,
    role_id,
    company_id,
    module_id,
    privilege_list,
    group_list,
    status,
    is_role_only_update
  ];
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("upsertUserRoleCompany-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Upsert URC Successful",
      data: rows,
    });
  } catch (err) {
    console.error("upsertUserRoleCompany-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to Upsert URC",
      data: err,
    });
  }
};

const getUserActivityLog = async (req, res) => {
  const { user_id } = req.query;
  const args = [user_id];
  const query = `CALL user.get_user_activity_log (@err,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("getUserActivityLog-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Found activity logs",
      data: rows,
    });
  } catch (err) {
    console.error("getUserActivityLog-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Not found activity logs",
      data: err,
    });
  }
};
const getUserCompany = async (req, res) => {
  const { app_user_id, user_company_id, user_id, company_id } = req.query;
  const args = [app_user_id, user_company_id, user_id, company_id];
  const query = `CALL user.get_user_company (@err,?,?,?,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("getUserCompany-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched user-company",
      data: rows,
    });
  } catch (err) {
    // console.error("getUserCompany-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fectch user-comapany",
      data: err,
    });
  }
};

const createUserCompany = async (req, res) => {
  const { app_user_id, user_id, company_id } = req.body;
  const args = [app_user_id, user_id, company_id];
  const query = `CALL user.create_user_company (@err,?,?,?,@out_id)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("createUserCompany-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully created user-company",
      data: rows,
    });
  } catch (err) {
    console.error("create_user_company-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to create user-comapany",
      data: err,
    });
  }
};

const editUserCompany = async (req, res) => {
  const { app_user_id, user_company_id, status } = req.body;
  const args = [app_user_id, user_company_id, status];
  const query = `CALL user.edit_user_company (@err,?,?,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("editUserCompany-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully updated user-company",
      data: rows,
    });
  } catch (err) {
    console.error("editUserCompany-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to updated user-comapany",
      data: err,
    });
  }
};

const fetchTktStatusType = async (req, res) => {
  const { ticket_status_type_id } = req.query;
  const args = [ticket_status_type_id];
  const query = `CALL user.get_ticket_status_type(@err,null)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("fetchTktStatusType-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched ticket status type",
      data: rows,
    });
  } catch (err) {
    console.error("fetchTktStatusType-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch ticket status type",
      data: err,
    });
  }
};

const fetchTktIssueCategoryType = async (req, res) => {
  const { ticket_issue_category_type_id } = req.query;
  const args = [ticket_issue_category_type_id];
  const query = `CALL user.get_ticket_issue_category_type(@err,null)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("fetchTktIssueCategoryType-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched ticket issue category type",
      data: rows,
    });
  } catch (err) {
    console.error("fetchTktIssueCategoryType-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch ticket issue category type",
      data: err,
    });
  }
};

const createNewTicket = async (req, res) => {
  const {
    app_user_id,
    ticket_status_type_id,
    ticket_issue_category_type_id,
    ticket_raised_by_id,
    ticket_raised_dtm,
    ticket_resolved_dtm,
  } = req.body;
  const args = [
    app_user_id,
    ticket_status_type_id,
    ticket_issue_category_type_id,
    ticket_raised_by_id,
    ticket_raised_dtm,
    ticket_resolved_dtm,
  ];
  const query = `CALL user.create_ticket (@err,?,?,?,?,?,?,@otktid); SELECT @otktid AS last_inserted_ticket_id;`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("create_ticket-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully raised a ticket",
      data: rows,
    });
  } catch (err) {
    console.error("create_ticket-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to raise ticket",
      data: err,
    });
  }
};

const editTicket = async (req, res) => {
  const {
    app_user_id,
    ticket_id,
    ticket_status_type_id,
    ticket_issue_category_type_id,
    ticket_raised_by_id,
    ticket_resolved_dtm,
    ticket_raised_dtm,
    status,
  } = req.body;
  const args = [
    app_user_id,
    ticket_id,
    ticket_status_type_id,
    ticket_issue_category_type_id,
    ticket_raised_by_id,
    ticket_resolved_dtm,
    ticket_raised_dtm,
    status,
  ];
  const query = `CALL user.edit_ticket (@err,?,?,?,?,?,?,?,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("create_ticket-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully updated a ticket",
      data: rows,
    });
  } catch (err) {
    console.error("create_ticket-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to update ticket",
      data: err,
    });
  }
};

const fetchAllTickets = async (req, res) => {
  const {
    app_user_id,
    ticket_id,
    ticket_status_type_id,
    ticket_issue_category_type_id,
    ticket_raised_by_id,
    ticket_raised_dtm,
    ticket_resolved_dtm,
  } = req.query;
  const args = [
    app_user_id,
    ticket_id,
    ticket_status_type_id,
    ticket_issue_category_type_id,
    ticket_raised_by_id,
    ticket_raised_dtm,
    ticket_resolved_dtm,
  ];
  const query = `CALL user.get_ticket(@err,?,?,?,?,?,?,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    // console.log("fetchAllTickets-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched tickets",
      data: rows,
    });
  } catch (err) {
    console.error("fetchAllTickets-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch tickets",
      data: err,
    });
  }
};

const fetchAllComments = async (req, res) => {
  const { ticket_id, comment_id } = req.query;
  const args = [ticket_id, comment_id];
  const query = `CALL user.get_comment(@err,?,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("fetchAllComments-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched comments",
      data: rows,
    });
  } catch (err) {
    console.error("fetchAllComments-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch comments",
      data: err,
    });
  }
};

const postNewComments = async (req, res) => {
  const { app_user_id, ticket_id, comment } = req.body;
  const args = [app_user_id, ticket_id, comment];
  const query = `CALL user.create_comment(@err,?,?,?,@ocid)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("create_comment-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully added comment on ticket",
      data: rows,
    });
  } catch (err) {
    console.error("create_comment-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to add comment on ticket",
      data: err,
    });
  }
};

const editComment = async (req, res) => {
  const { app_user_id, comment_id, comment, status } = req.body;
  const args = [app_user_id, comment_id, comment, status];
  const query = `CALL user.edit_comment (@err,?,?,?,?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("editComment-res", rows);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully updated a comment",
      data: rows,
    });
  } catch (err) {
    console.error("editComment-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to update comment",
      data: err,
    });
  }
};

const getAssociatedUsers = async (req, res) => {
  const { reporting_to_id } = req.query;
  const args = [reporting_to_id];
  const query = `CALL user.get_all_associated_users(@err, ?)`;
  try {
    const { rows } = await commonController.executeQuery(query, args);
    //console.log("associated_users-res", rows[0].length);
    return res.status(200).json({
      errorCode: 0,
      message: "Successfully fetched associated users",
      data: rows,
    });
  } catch (err) {
    console.error("associated_users-err", err);
    return res.status(500).json({
      errorCode: 1,
      message: "Failed to fetch associated users",
      data: err,
    });
  }
};

module.exports = {
  createUser,
  createUserActivity,
  createUserNotification,
  createUserPreferences,
  createUserTemplateActionLog,
  deleteUserRoleCompany,
  editUserNotification,
  editUserPreferences,
  editUserRoleCompany,
  editUser,
  getGroupAssigneeList,
  getModuleApproverList,
  getModules,
  getNotificationType,
  getPrivilege,
  getRole,
  getUserDashboardCount,
  getUserNotification,
  getUserPreference,
  getUserPreferredNotifType,
  getUserRoleCompany,
  getUserTemplateActionLog,
  getUserTemplateDocs,
  getUser,
  forgotPassword,
  forgotPasswordGenJWT,
  resetPassword,
  grantRoleModulePrivileges,
  login,
  setAutoNotifAck,
  upsertUserRoleCompany,
  getUserActivityLog,
  getUserCompany,
  createUserCompany,
  editUserCompany,
  loginV1,
  fetchTktStatusType,
  fetchTktIssueCategoryType,
  createNewTicket,
  fetchAllTickets,
  postNewComments,
  fetchAllComments,
  editTicket,
  editComment,
  getMac,
  getAssociatedUsers,
  getITManagerDetails,
};
