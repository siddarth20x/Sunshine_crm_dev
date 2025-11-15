const express = require("express");
const router = express.Router();
const auth = require("../../middleware/jwt");

const userController = require("../../controller/users/user.controller");

router.post("/create", userController.createUser);
router.post("/create/notifications", userController.createUserNotification);
router.post("/create/preferences", userController.createUserPreferences);
router.post("/grant-role-mod-priv", userController.grantRoleModulePrivileges);
router.post("/login", userController.login);
router.post("/login/v1", userController.loginV1);
router.post("/set-auto-notif-ack", userController.setAutoNotifAck);
router.post("/upsert-urc", userController.upsertUserRoleCompany);

router.get("/mac-address", userController.getMac);

router.delete("/delete/urc", userController.deleteUserRoleCompany);

router.put("/edit/notifications", userController.editUserNotification);
router.put("/edit/preferences", userController.editUserPreferences);
router.put("/edit/urc", userController.editUserRoleCompany);
router.put("/edit", userController.editUser);

router.get("/get/group-assign-list", userController.getGroupAssigneeList);
router.get("/get/module-approver-list", userController.getModuleApproverList);
router.get("/get/modules", userController.getModules);
router.get("/get/notif-type", userController.getNotificationType);
router.get("/get/privilege", userController.getPrivilege);
router.get("/get/role", userController.getRole);
router.get("/get/dashboard-counts", userController.getUserDashboardCount);
router.get("/get/notifications", userController.getUserNotification);
router.get("/get/preferences", userController.getUserPreference);
router.get("/get/notif-pref-type", userController.getUserPreferredNotifType);
router.get("/get/urc", userController.getUserRoleCompany);
router.get("/get/temp-docs", userController.getUserTemplateDocs);
router.get("/get", auth.verifyToken, userController.getUser);

//! forgot-password
router.get("/forgot-password", userController.forgotPassword);
router.post("/forgot-password/gen-token", userController.forgotPasswordGenJWT);

//! reset-password
router.put("/reset-password", userController.resetPassword);

router.get(
  "/get/activityLogs",
  auth.verifyToken,
  userController.getUserActivityLog
);
router.get(
  "/get/user-company",
  auth.verifyToken,
  userController.getUserCompany
);
router.post(
  "/post/user-company",
  auth.verifyToken,
  userController.createUserCompany
);
router.put(
  "/put/user-company",
  auth.verifyToken,
  userController.editUserCompany
);
// router.get("/get", userController.getUser);

router.get(
  "/get/ticket-status-type",
  auth.verifyToken,
  userController.fetchTktStatusType
);
router.get(
  "/get/ticket-issue-cateogry",
  auth.verifyToken,
  userController.fetchTktIssueCategoryType
);

router.post(
  "/post/new-ticket",
  auth.verifyToken,
  userController.createNewTicket
);

router.put("/put/ticket", auth.verifyToken, userController.editTicket);

router.get(
  "/get/all-tickets",
  auth.verifyToken,
  userController.fetchAllTickets
);

router.get("/get/comments", auth.verifyToken, userController.fetchAllComments);
router.post("/post/comment", auth.verifyToken, userController.postNewComments);
router.put("/put/comment", auth.verifyToken, userController.editComment);
router.get("/get/associated-users",auth.verifyToken,userController.getAssociatedUsers);
router.get("/get/it-manager", auth.verifyToken, userController.getITManagerDetails);

module.exports = router;
