import MailTemplate from "@/components/emailTemplates/MailTemplate";
import prisma from "@/db";
import { sendMail } from "@/lib/resend";
import otpGenerator from "otp-generator";

// Workflow:
// 1. Generate otp
// 2. Send otp to user
// 3. Store otp in db if no error
// 4. Return otp

export async function generateAndSendOtp(email: string) {
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  try {
    const { error } = await sendMail(email, "Email Verification", MailTemplate({ otp: otp }));

    if (error) {
      return null;
    }

    const newOtp = await prisma.otp.create({
      data: {
        code: otp,
        email: email,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return newOtp.code;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}
