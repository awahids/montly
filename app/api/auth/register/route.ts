import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  let body: z.infer<typeof signUpSchema>;
  try {
    body = signUpSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid input data",
      },
      { status: 400 },
    );
  }

  const supabase = createClient();
  const admin = createAdminClient();

  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: { data: { name: body.name } },
  });

  if (error) {
    let message = "Registration failed";

    if (
      error.message.includes("already registered") ||
      error.message.includes("already exists")
    ) {
      message = "An account already exists for this email address.";
    } else if (error.message.includes("weak_password")) {
      message = "Password is too weak. Please choose a stronger password.";
    } else if (error.message.includes("invalid_credentials")) {
      message = "Invalid email or password format.";
    } else {
      message = error.message;
    }

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 400 },
    );
  }

  const userId = data.user?.id;
  if (userId) {
    const profile = await admin.from("profiles").insert({
      id: userId,
      email: body.email,
      name: body.name,
      default_currency: "IDR",
    });

    if (!profile) {
      console.error("Profile creation error");
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to create user profile. Please try again.",
        },
        { status: 500 },
      );
    }

    // clear auth cookies to require sign in after sign up
    await supabase.auth.signOut();
  }

  return NextResponse.json({
    ok: true,
    message:
      "Registration successful. Please check your email to verify your account.",
  });
}
