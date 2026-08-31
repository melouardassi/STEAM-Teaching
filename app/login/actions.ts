"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
    return { error: "Please enter your email and password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    // NEXT_REDIRECT and other framework-internal throws must propagate.
    throw error;
  }
}
