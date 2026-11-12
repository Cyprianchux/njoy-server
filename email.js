(function (global) {
  "use strict";

  var BRAND = {
    primary: "#FFB000",
    accent: "#FF7402",
    dark: "#10121B",
    light: "#FFF9ED",
    border: "#f0e2c4",
    muted: "#5b5f6b",
  };

  var DEFAULTS = {
    brandName: "njoy-gadgets",
    companyName: "njoy-gadgets",
    tagline: "More Gadgets. More Joy.",
    supportEmail: "support@njoygadgets.com",
    supportPhone: "+234 806 648 6351",
    address: "Plot 34 worker's Village Ugwu Achara, Abakaliki, Ebonyi State",
    siteUrl: "",
    logoUrl: "",
  };

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function money(amount) {
    return "\u20A6" + Number(amount || 0).toLocaleString();
  }

  function formatDate(dateValue) {
    var date = dateValue ? new Date(dateValue) : new Date();
    if (isNaN(date.getTime())) date = new Date();
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(dateValue) {
    var date = dateValue ? new Date(dateValue) : new Date();
    if (isNaN(date.getTime())) date = new Date();
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function resolveLogoUrl(options) {
    if (options.logoUrl) return options.logoUrl;
    if (options.siteUrl) {
      return options.siteUrl.replace(/\/$/, "") + "/website/images/njoy-logo.png";
    }
    if (global.location && global.location.href) {
      try {
        return new URL("../images/njoy-logo.png", global.location.href).href;
      } catch (e) {
        return "";
      }
    }
    return "";
  }

  function buildOrderConfirmationEmail(order, options) {
    order = order || {};
    var opts = Object.assign({}, DEFAULTS, options || {});
    var logoUrl = resolveLogoUrl(opts);
    var items = Array.isArray(order.items) ? order.items : [];
    var customerName =
      (order.firstName || "") + " " + (order.lastName || "");
    customerName = customerName.trim() || "Customer";
    var orderId = order.orderId || "ORD-000000";
    var orderDate = formatDate(order.orderDate);
    var orderTime = formatTime(order.orderDate);
    var total =
      order.total !== undefined
        ? order.total
        : items.reduce(function (sum, item) {
            return sum + Number(item.price || 0) * Number(item.quantity || 0);
          }, 0);

    var itemRows = items
      .map(function (item) {
        var lineTotal =
          Number(item.price || 0) * Number(item.quantity || 0);
        return (
          '<tr>' +
          '<td style="padding:14px 12px;border-bottom:1px solid ' +
          BRAND.border +
          ';font-size:14px;color:' +
          BRAND.dark +
          ';">' +
          escapeHtml(item.name) +
          "</td>" +
          '<td style="padding:14px 12px;border-bottom:1px solid ' +
          BRAND.border +
          ";font-size:14px;color:" +
          BRAND.dark +
          ';text-align:center;">' +
          escapeHtml(item.quantity) +
          "</td>" +
          '<td style="padding:14px 12px;border-bottom:1px solid ' +
          BRAND.border +
          ";font-size:14px;color:" +
          BRAND.dark +
          ';text-align:right;white-space:nowrap;">' +
          money(item.price) +
          "</td>" +
          '<td style="padding:14px 12px;border-bottom:1px solid ' +
          BRAND.border +
          ";font-size:14px;font-weight:600;color:" +
          BRAND.dark +
          ';text-align:right;white-space:nowrap;">' +
          money(lineTotal) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    if (!itemRows) {
      itemRows =
        '<tr><td colspan="4" style="padding:20px 12px;text-align:center;color:' +
        BRAND.muted +
        ';font-size:14px;">No items in this order.</td></tr>';
    }

    var logoBlock = logoUrl
      ? '<img src="' +
        escapeHtml(logoUrl) +
        '" alt="' +
        escapeHtml(opts.brandName) +
        '" width="150" height="75" style="display:block;margin:0 auto 10px;border:0;outline:none;text-decoration:none;max-width:100%;height:auto;" />'
      : "";

    var html =
      '<!doctype html>' +
      '<html lang="en"><head><meta charset="utf-8" />' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
      "<title>Order Confirmation</title></head>" +
      '<body style="margin:0;padding:0;background-color:' +
      BRAND.light +
      ';font-family:Arial,Helvetica,sans-serif;color:' +
      BRAND.dark +
      ';">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:' +
      BRAND.light +
      ';padding:30px 12px;">' +
      "<tr><td align=\"center\">" +
      '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid ' +
      BRAND.border +
      ';">' +
      '<tr><td style="background:' +
      BRAND.dark +
      ';padding:28px 30px;text-align:center;">' +
      logoBlock +
      '<div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">' +
      escapeHtml(opts.brandName) +
      "</div>" +
      '<div style="font-size:12px;color:#ffd99a;margin-top:4px;">' +
      escapeHtml(opts.tagline) +
      "</div>" +
      "</td></tr>" +
      '<tr><td style="padding:32px 30px 10px;">' +
      '<h1 style="margin:0 0 10px;font-size:22px;color:' +
      BRAND.dark +
      ';">Order Confirmed</h1>' +
      '<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:' +
      BRAND.dark +
      ';">Dear ' +
      escapeHtml(customerName) +
      ",</p>" +
      '<p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:' +
      BRAND.muted +
      ';">Thank you for your order. We have received your order details and will contact you soon to confirm delivery. Below is a summary of your order.</p>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">' +
      "<tr>" +
      '<td style="padding:8px 0;font-size:13px;color:' +
      BRAND.muted +
      ';">Order Number</td>' +
      '<td style="padding:8px 0;font-size:14px;font-weight:700;color:' +
      BRAND.dark +
      ';text-align:right;">' +
      escapeHtml(orderId) +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td style="padding:8px 0;font-size:13px;color:' +
      BRAND.muted +
      ';">Order Date</td>' +
      '<td style="padding:8px 0;font-size:14px;color:' +
      BRAND.dark +
      ';text-align:right;">' +
      escapeHtml(orderDate) +
      '<br><span style="display:inline-block;margin-top:2px;font-size:12px;color:' +
      BRAND.muted +
      ';">' +
      escapeHtml(orderTime) +
      "</span></td>" +
      "</tr>" +
      "</table>" +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ' +
      BRAND.border +
      ';border-radius:8px;overflow:hidden;margin-bottom:24px;">' +
      '<tr style="background:' +
      BRAND.light +
      ';">' +
      '<th align="left" style="padding:12px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:' +
      BRAND.accent +
      ';border-bottom:1px solid ' +
      BRAND.border +
      ';">Item</th>' +
      '<th align="center" style="padding:12px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:' +
      BRAND.accent +
      ';border-bottom:1px solid ' +
      BRAND.border +
      ';">Qty</th>' +
      '<th align="right" style="padding:12px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:' +
      BRAND.accent +
      ';border-bottom:1px solid ' +
      BRAND.border +
      ';">Unit Price</th>' +
      '<th align="right" style="padding:12px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:' +
      BRAND.accent +
      ';border-bottom:1px solid ' +
      BRAND.border +
      ';">Subtotal</th>' +
      "</tr>" +
      itemRows +
      "</table>" +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">' +
      "<tr>" +
      '<td style="padding:6px 0;font-size:16px;font-weight:700;color:' +
      BRAND.dark +
      ';">Order Total</td>' +
      '<td style="padding:6px 0;font-size:20px;font-weight:700;color:' +
      BRAND.accent +
      ';text-align:right;">' +
      money(total) +
      "</td>" +
      "</tr>" +
      "</table>" +
      '<h2 style="margin:0 0 12px;font-size:16px;color:' +
      BRAND.dark +
      ';">Account Details</h2>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' +
      BRAND.light +
      ';border-radius:8px;margin-bottom:28px;">' +
      '<tr><td style="padding:18px 20px;font-size:14px;line-height:1.7;color:' +
      BRAND.dark +
      ';">' +
      "<strong>Account Name:</strong> njoy-gadgets<br />" +
      "<strong>Account Number:</strong> 1234567890<br />" +
      "<strong>Bank:</strong> Njoy Bank Limited" +
      "</td></tr>" +
      "</table>" +
      '<h2 style="margin:0 0 12px;font-size:16px;color:' +
      BRAND.dark +
      ';">Delivery Details</h2>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' +
      BRAND.light +
      ';border-radius:8px;margin-bottom:28px;">' +
      '<tr><td style="padding:18px 20px;font-size:14px;line-height:1.7;color:' +
      BRAND.dark +
      ';">' +
      "<strong>" +
      escapeHtml(customerName) +
      "</strong><br />" +
      escapeHtml(order.phone || "") +
      "<br />" +
      escapeHtml(order.address || "") +
      "<br />" +
      escapeHtml((order.city || "") + (order.state ? ", " + order.state : "")) +
      "</td></tr>" +
      "</table>" +
      '<p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:' +
      BRAND.muted +
      ';">If you have any questions about your order, please contact us:</p>' +
      '<p style="margin:0 0 4px;font-size:14px;color:' +
      BRAND.dark +
      ';">Email: <a href="mailto:' +
      escapeHtml(opts.supportEmail) +
      '" style="color:' +
      BRAND.primary +
      ';text-decoration:none;">' +
      escapeHtml(opts.supportEmail) +
      "</a></p>" +
      '<p style="margin:0 0 28px;font-size:14px;color:' +
      BRAND.dark +
      ';">Phone: ' +
      escapeHtml(opts.supportPhone) +
      "</p>" +
      '<p style="margin:0;font-size:14px;line-height:1.6;color:' +
      BRAND.dark +
      ';">Warm regards,<br /><strong>' +
      escapeHtml(opts.companyName) +
      "</strong></p>" +
      "</td></tr>" +
      '<tr><td style="background:' +
      BRAND.dark +
      ';padding:22px 30px;text-align:center;">' +
      '<div style="font-size:13px;font-weight:700;color:#ffffff;margin-bottom:6px;">' +
      escapeHtml(opts.companyName) +
      "</div>" +
      '<div style="font-size:11px;line-height:1.6;color:#bdbdbd;">' +
      escapeHtml(opts.address) +
      "<br />" +
      escapeHtml(opts.supportPhone) +
      " &middot; " +
      escapeHtml(opts.supportEmail) +
      "</div>" +
      '<div style="font-size:11px;color:#8a8a8a;margin-top:10px;">&copy; ' +
      new Date().getFullYear() +
      " " +
      escapeHtml(opts.companyName) +
      ". All rights reserved.</div>" +
      "</td></tr>" +
      "</table>" +
      "</td></tr></table>" +
      "</body></html>";

    var text =
      "Order Confirmed - " +
      opts.companyName +
      "\n\n" +
      "Dear " +
      customerName +
      ",\n\nThank you for your order " +
      orderId +
      " placed on " +
      orderDate +
      " at " +
      orderTime +
      ".\n\n" +
      items
        .map(function (item) {
          return (
            "- " +
            item.name +
            " x " +
            item.quantity +
            " @ " +
            money(item.price) +
            " = " +
            money(Number(item.price || 0) * Number(item.quantity || 0))
          );
        })
        .join("\n") +
      "\n\nOrder Total: " +
      money(total) +
      "\n\nDelivery: " +
      order.address +
      ", " +
      order.city +
      ", " +
      order.state +
      "\n\nContact: " +
      opts.supportEmail +
      " | " +
      opts.supportPhone;

    return {
      subject: "Order Confirmed - " + orderId + " | " + opts.brandName,
      html: html,
      text: text,
    };
  }

  var api = {
    buildOrderConfirmationEmail: buildOrderConfirmationEmail,
    escapeHtml: escapeHtml,
    money: money,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
