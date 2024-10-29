import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import MailTemplate from "@/components/MailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function generateAndSendOtp(email: string) {
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  // const mailOptions = {
  //   from: process.env.SMTP_USER,
  //   to: email,
  //   subject: "Email Verification",
  //   text: `Your OTP is ${otp}`,
  // };

  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: Number(process.env.SMTP_PORT),
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS,
  //   },
  // });

  try {
    // await transporter.sendMail(mailOptions);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: email,
      subject: "Hello world",
      react: MailTemplate({ otp }),
    });
    
    if (error) {
      return null;
    }

    return otp;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}
