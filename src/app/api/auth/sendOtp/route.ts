import { generateAndSendOtp } from "@/actions/sendOtp";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { email } = await z
    .object({ email: z.string().email() })
    .parseAsync(body);

  try {
    const otp = await generateAndSendOtp(email);
    if (!otp) {
      return NextResponse.json(
        { message: "Failed to send otp. Check your email and try again" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: `Email sent to your ${email}` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const formattedMessage = (() => {
        const firstErrorKey = Object.keys(fieldErrors)[0];
        if (!firstErrorKey) return "Invalid input";

        const firstError = fieldErrors[firstErrorKey]?.[0];
        if (firstError === "Required") {
          return `${firstErrorKey.charAt(0).toUpperCase()}${firstErrorKey.slice(
            1
          )} is required`;
        }
        return firstError || "Invalid input";
      })();

      return NextResponse.json({ message: formattedMessage }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
