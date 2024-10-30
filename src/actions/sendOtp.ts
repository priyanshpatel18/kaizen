import MailTemplate from "@/components/emailTemplates/MailTemplate";
import { sendMail } from "@/lib/resend";
import otpGenerator from "otp-generator";

export async function generateAndSendOtp(email: string) {
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  try {
    const { data, error } = await sendMail(
      email,
      "OTP Verification",
      MailTemplate({ otp: otp })
    );

    if (error) {
      return null;
    }

    return otp;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}
