import { ReactNode } from "react";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(email: string, subject: string, react: ReactNode) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: email,
    subject: subject,
    react,
  });

  return { data, error };
}
