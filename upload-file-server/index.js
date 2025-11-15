const express = require("express");
require("dotenv").config();
const env = process.env;
const server = express();
const port = 8080;

const cors = require("cors");

server.use(cors());
server.use(function (req, res, next) {
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
server.use(express.json());

server.use("/api", require("./src/routes/routes"));


server.listen(`${port}`, function check(error) {
    if (error) {
      console.log("error", error);
    } else {
      console.log(`Server is listening to ${port}`);
    }
  });