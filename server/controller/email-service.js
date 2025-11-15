var axios = require("axios");
var dotenv = require("dotenv");
dotenv.config();

const sendEmail = async (req, res) => {
  let reqBody = req.body;
  // console.log("reqBody--", reqBody);

  let emailAPI = process.env.EMAIL_SERVICE_BASE_URL;
  let emailApibody = {
    from: "info@mailers.codeswift.in",
    to: reqBody.to,
    subjectLine: reqBody.subject,
    htmlToSend: Buffer.from(reqBody.emailBody).toString("base64"),
    swiftMailApiKey: process.env.SWIFT_EMAIL_KEY,
  };

  // console.log("emailApibody--->", emailApibody);

  axios.post(emailAPI, emailApibody).then(
    (emailRes) => {
      console.log("res email from api--->", emailRes.data);
      res.send(emailRes.data);
    },
    (error) => {
      console.log("email error from api-->", error);
      res.send(error);
    }
  );
};

module.exports = { sendEmail };
