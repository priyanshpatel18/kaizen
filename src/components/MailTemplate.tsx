interface EmailTemplateProps {
  otp: string;
}

export default function MailTemplate({ otp }: EmailTemplateProps) {
  return <div>{otp}</div>;
}
