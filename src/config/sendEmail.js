const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, otptype, otp) => {
  await transporter.sendMail({
    from: `"Hike" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your OTP Code for ${otptype}`,
    html: `
      <div style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:20px 0;">
          <tr>
            <td align="center">
              <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;padding:30px;text-align:center;">
                
                <tr>
                  <td style="font-size:22px;font-weight:bold;color:#333;">
                    Verify Your ${otptype}
                  </td>
                </tr>

                <tr>
                  <td style="padding:15px 0;color:#555;font-size:14px;">
                    Use the OTP below to complete your ${otptype}. This code is valid for 5 minutes.
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 0;">
                    <div style="
                      display:inline-block;
                      background:#f1f5ff;
                      color:#2b6cb0;
                      font-size:28px;
                      letter-spacing:6px;
                      font-weight:bold;
                      padding:15px 25px;
                      border-radius:8px;
                    ">
                      ${otp}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="font-size:13px;color:#888;">
                    If you didn’t request this, you can safely ignore this email.
                  </td>
                </tr>

                <tr>
                  <td style="padding-top:20px;font-size:12px;color:#aaa;">
                    © ${new Date().getFullYear()} Your App. All rights reserved.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
};

module.exports = { sendEmail };
