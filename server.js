"use strict";

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const { buildOrderConfirmationEmail } = require("./email.js");

const PORT = process.env.PORT || 3000;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "").toLowerCase() === "true" ||
  SMTP_PORT === 465;

const TRANSPORTER_CONFIGURED = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const app = express();
app.use(express.json({ limit: "1mb" }));

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5501",
  "http://127.0.0.1:5501",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

const configuredOrigins = (process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins =
  configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;

if (configuredOrigins.length === 0) {
  console.warn(
    "ALLOWED_ORIGIN is not set; allowing local development origins only: " +
      DEFAULT_ALLOWED_ORIGINS.join(", "),
  );
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  }),
);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "njoy-email-server",
    health: "/api/health",
    sendConfirmation: "POST /api/send-confirmation",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "njoy-email-server",
    smtpConfigured: TRANSPORTER_CONFIGURED,
  });
});

app.post("/api/send-confirmation", async (req, res) => {
  const order = req.body && req.body.order;

  if (!order || typeof order !== "object") {
    return res.status(400).json({ error: "Missing order details." });
  }

  const to = String(order.email || "").trim();
  if (!emailPattern.test(to)) {
    return res
      .status(400)
      .json({ error: "A valid customer email is required." });
  }

  if (!TRANSPORTER_CONFIGURED) {
    return res.status(503).json({
      error: "Email service is not configured. Set the SMTP_* variables.",
    });
  }

  const options = Object.assign(
    {
      siteUrl: process.env.PUBLIC_SITE_URL || "",
      logoUrl: process.env.EMAIL_LOGO_URL || "",
      supportEmail: process.env.SUPPORT_EMAIL,
      supportPhone: process.env.SUPPORT_PHONE,
    },
    req.body.options || {},
  );

  try {
    const email = buildOrderConfirmationEmail(order, options);

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      bcc: process.env.ADMIN_EMAIL || undefined,
      replyTo: process.env.SUPPORT_EMAIL || undefined,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    return res.json({ ok: true, message: "Confirmation email sent." });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return res.status(502).json({
      error: "Failed to send confirmation email.",
      details: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.listen(PORT, () => {
  console.log(`njoy email server listening on port ${PORT}`);
  if (!TRANSPORTER_CONFIGURED) {
    console.warn(
      "SMTP is not fully configured; confirmation emails will return 503 until SMTP_* variables are set.",
    );
    return;
  }
  transporter.verify((error) => {
    if (error) {
      console.error("SMTP verification failed:", error.message);
    } else {
      console.log("SMTP connection verified.");
    }
  });
});
