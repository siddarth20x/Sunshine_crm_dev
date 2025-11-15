// const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
// const bodyParser = require("body-parser");
// const path = require("path");
require("dotenv").config();
const DB = require("./config/db");
// const fileUpload = require("express-fileupload");

const userApi = require("./routes/users/user.routes");
const orgApi = require("./routes/org/org.routes");
const stageApi = require("./routes/stage/stage.routes");
const crmApi = require("./routes/crm/crm.routes");
const sendMailApi = require("./routes/email-service-routes");
const reportsApi = require("./routes/reports/reports.routes");
const accountApi = require("./routes/account/account.routes");
//! Initialize the
const app = express();

//! Connect to DB
DB.getConnection(function (err, connection) {
  if (err) throw err;
  else console.log("Connected to database");
});

const port = process.env.PORT || 5000;

// app.use(express.static("./public"));

// app.use(bodyparser.json());
// app.use(
//     bodyparser.urlencoded({
//         extended: true,
//     })
// );
// app.use(bodyParser.json({ limit: "150mb" }));
app.use(express.json());
app.use(cors());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization, userName, customparams, token, x-access-token"
  );
  next();
});

// Only use express.json() for APIs that expect JSON (not file uploads)
app.use("/api/user", express.json(), userApi);
app.use("/api/org", express.json(), orgApi);
app.use("/api/stage", express.json(), stageApi);
app.use("/api/crm", express.json(), crmApi);
app.use("/api/send", express.json(), sendMailApi);
app.use("/api/reports", express.json(), reportsApi);

// Mount /api/account WITHOUT express.json() or fileUpload()
app.use("/api/account", accountApi);

app.listen(port, () =>
  console.log(`Sunshine Server running http://localhost:${port}`)
);