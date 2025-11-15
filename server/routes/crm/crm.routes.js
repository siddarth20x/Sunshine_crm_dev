const express = require("express");
const router = express.Router();
const auth = require("../../middleware/jwt");
const crmController = require("../../controller/crm/crm.controller");
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
const commonController = require("../../helpers/common");

router.get("/get/leads", auth.verifyToken, crmController.fetchAllLeads);
router.put("/update/lead", auth.verifyToken, crmController.updateLead);
router.get(
  "/get/disposition-types",
  auth.verifyToken,
  crmController.getAllDispositionTypes
);
// router.get("/get/task-types", auth.verifyToken, crmController.getAllTaskTypes);
router.get("/get/task-types", crmController.getAllTaskTypes);
router.get(
  "/get/task-status-types",
  auth.verifyToken,
  crmController.getAllTaskStatusTypes
);

router.post("/create/tasks", auth.verifyToken, crmController.createNewTask);
router.get("/get/tasks", auth.verifyToken, crmController.fetchAllTasks);
router.get("/get/leads", auth.verifyToken, crmController.fetchAllLeads);
router.post(
  "/upload-documents",
  auth.verifyToken,
  upload.array('files', 5),
  crmController.uploadDocuments
);
router.get("/get/docs", auth.verifyToken, crmController.getDocuments);
router.put("/put/task-by-id", auth.verifyToken, crmController.putTaskByTaskId);
router.get("/get/notes", auth.verifyToken, crmController.fetchAllNotes);
router.post("/create/note", auth.verifyToken, crmController.createNewNotes);
router.post(
  "/get/leadsBySearchParams",
  auth.verifyToken,
  crmController.getLeadsBySearchParams
);

router.get(
  "/get/leads-activity-logs",
  auth.verifyToken,
  crmController.fetchAllCrmUserLogActivity
);
router.put("/put/note", auth.verifyToken, crmController.updateNotes);
router.get(
  "/get/lead-status-type",
  auth.verifyToken,
  crmController.getAllLeadStatusTypes
);

router.get(
  "/get/disposition-code",
  auth.verifyToken,
  crmController.getDispositionCode
);
router.post(
  "/post/disposition-code",
  auth.verifyToken,
  crmController.createDispositionCode
);
router.put(
  "/put/disposition-code",
  auth.verifyToken,
  crmController.editDispositionCode
);

router.get(
  "/get/dashboard-counts",
  auth.verifyToken,
  crmController.getDashboardCounts
);

router.get("/get/target-stats", auth.verifyToken, crmController.getTargetStats);

router.get(
  "/get/sq-params-type",
  auth.verifyToken,
  crmController.getSQParameterType
);

router.post(
  "/post/sq-check",
  auth.verifyToken,
  crmController.createSQCheckScores
);

router.get("/get/sq-check", auth.verifyToken, crmController.fetchSQCheckScores);

router.post(
  "/post/payment-ledger-entry",
  auth.verifyToken,
  crmController.createNewPaymentLedgerEntry
);

router.get(
  "/get/leads-payment-ledger",
  auth.verifyToken,
  crmController.getAllLeadsPaymentLedgerEntry
);

router.put(
  "/put/leads-payment-ledger",
  auth.verifyToken,
  crmController.editPaymentLedgerEntry
);

router.get(
  "/get/lead-contact",
  auth.verifyToken,
  crmController.getAllContactsByLead
);
router.get(
  "/get/lead-address",
  auth.verifyToken,
  crmController.getAllAddressByLead
);

router.post(
  "/post/new-contact",
  auth.verifyToken,
  crmController.postNewContact
);

router.post(
  "/post/new-address",
  auth.verifyToken,
  crmController.postNewAddress
);

router.get(
  "/get/visa-check",
  auth.verifyToken,
  crmController.getAllVisaCheckByLead
);

router.get(
  "/get/mol-check",
  auth.verifyToken,
  crmController.getAllMOLCheckByLead
);

router.post(
  "/post/new-visa-check",
  auth.verifyToken,
  crmController.postNewVisaCheckByLead
);

router.post(
  "/post/new-mol-check",
  auth.verifyToken,
  crmController.postNewMOLCheckByLead
);

router.get(
  "/get/tracing-source-type",
  auth.verifyToken,
  crmController.getTracingSourceType
);

router.get(
  "/get/web-tracing",
  auth.verifyToken,
  crmController.getWebTracingDetails
);

router.post(
  "/post/web-tracing",
  auth.verifyToken,
  crmController.postNewWebTracing
);

router.get(
  "/get/tracing-details",
  auth.verifyToken,
  crmController.getTracingDetails
);

router.post(
  "/post/tracing-details",
  auth.verifyToken,
  crmController.postNewTracingDetails
);

router.get(
  "/get/inactive-users",
  auth.verifyToken,
  crmController.getAllInactiveUsers
);

router.get("/get/targets", auth.verifyToken, crmController.getAllTargets);
router.post("/post/new-target", auth.verifyToken, crmController.postNewTargets);
router.put("/put/target", auth.verifyToken, crmController.editAssignedTarget);

router.get('/validate-entries-by-task-id',auth.verifyToken,crmController.validateEnteriesByTaskId)

router.get("/get/todays-tasks", auth.verifyToken, crmController.getTodaysTasks);
router.get("/get/escalation-tasks", auth.verifyToken, crmController.getEscalationTasks);
router.get("/get/tasks-count", auth.verifyToken, crmController.getTasksCount);
router.get("/get/account-emirates-ids", auth.verifyToken, crmController.getAccountEmiratesIds);
router.post("/add/emirates-id", auth.verifyToken, crmController.addEmiratesIdToAccount);

module.exports = router;
