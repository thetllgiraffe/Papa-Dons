const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "scottlynnfwa@gmail.com",
    pass: process.env.mailer_password,
  },
});

module.exports = transporter;