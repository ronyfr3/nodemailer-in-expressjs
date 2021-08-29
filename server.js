require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const app = express();
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());

// GET
const data = [];
app.get("/msg", (req, res) => {
  res.send(data);
});
// NODEMAILER
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.OAUTH_CLIENTID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_URL
);
oauth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
});
const access_token = oauth2Client.getAccessToken();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL1,
    pass: process.env.EMAIL1_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    accessToken: access_token,
  },
  // tls: {
  //   rejectUnauthorized: false,
  // },
});

transporter.verify((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is ready to take messages: ${success}`);
  }
});

app.post("/send", (req, res) => {
  data.push(req.body);
  let mailOptions = {
    from: `${req.body.email}`,
    to: "email1,email2,email3",
    subject: `${req.body.name} Message you, From:${req.body.email}`,
    text: `Type of services Selected: ${req.body.dropdown}
          Message: ${req.body.message}
     `,
  };
  transporter.sendMail(mailOptions, function (err, res) {
    if (err) {
      res.status(500).json({
        msg: "fail",
      });
    } else {
      res.status(200).json({
        msg: "success",
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
