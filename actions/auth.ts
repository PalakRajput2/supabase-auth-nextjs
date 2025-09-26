"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";


export async function getUserSession() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        return null;
    }
    return {
        status: "success",
        user: data?.user
    }
}
export async function signUp(formData: FormData) {
    const supabase = await createClient();

    const credentials = {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const { error, data } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
            data: {
                username: credentials.username
            }
        }
    })

    if (error) {
        return {
            status: error?.message,
            user: null,
        }
    } else if (data?.user?.identities?.length === 0) {
        return {
            status: "User with this email id already exist , please login ",
            user: null,
        }
    }

    revalidatePath("/", "layout")
    return { status: "success", user: data.user }
}

export async function signIn(formData: FormData) {
    const supabase = await createClient();

    const credentials = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error, data } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
        return {
            status: error?.message,
            user: null,
        };
    }
    // Check if user exists in user_profiles
    const { data: existingUser } = await supabase
        .from("user_profile")
        .select("*")
        .eq("email", credentials.email)
        .limit(1)
        .single();

    if (!existingUser) {
        const { error: innerError } = await supabase.from("user_profile").insert({
            email: data.user.email,
            username: data.user?.user_metadata?.username,
        });

        //  Ignore duplicate key error and continue
        if (innerError && !innerError.message.includes("duplicate key value")) {
            return {
                status: innerError.message,
                user: null,
            };
        }
    }

    revalidatePath("/", "layout");
    return { status: "success", user: data.user };
}


export async function signOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    return { error };
}


export async function signInWithGithub() {
    const origin = (await headers()).get("origin");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${origin}/auth/callback`,
        }
    })
    if (error) {
        redirect("/error");

    } else if (data.url) {
        return redirect(data.url)
    
    }
}


export async function forgotPassword(formData: FormData) {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { error } = await supabase.auth.resetPasswordForEmail(
        formData.get("email") as string,
        {
            redirectTo: `${origin}/reset-password`,
        }
    );

    if (error) {
        return { status: error.message };
    }
    return { status: "success" };
}


export async function resetPassword(formData: FormData, code: string) {
    const supabase = await createClient();

    // exchange code for a session
    const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
    if (codeError) {
        return { status: codeError.message };
    }
    // update password
    const { error } = await supabase.auth.updateUser({
        password: formData.get("password") as string,
    });

    if (error) {
        return { status: error.message };
    }
    return { status: "success" };
}



/** Send OTP email (6-digit code) */
export async function signInWithOtp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { status: error.message };
  }

  return { status: "OTP sent to your email", data };
}

/** Verify OTP token from magic link */
export async function verifyOtp(formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;

  if (!email || !token) {
    return { status: "Email and OTP token are required", user: null };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email', 
    });

    if (error) {
      console.error('OTP verification error:', error);
      return { status: error.message, user: null };
    }

    if (!data.user) {
      return { status: "User not found after OTP verification", user: null };
    }

    // insert into user_profile table if not exists
    const { data: existingUser } = await supabase
      .from("user_profile")
      .select("*")
      .eq("email", data.user.email)
      .limit(1)
      .single();

    if (!existingUser) {
      await supabase.from("user_profile").insert({
        email: data.user.email,
        username: data.user.user_metadata?.username ,
      });
    }

    revalidatePath("/", "layout");
    return { status: "success", user: data.user };

  } catch (error) {
    console.error('Unexpected error in verifyOtp:', error);
    return { status: "An unexpected error occurred", user: null };
  }
}


/** Resend OTP email */
export async function resendOtp(email: string) {
  const supabase = await createClient();

  if (!email) {
    return { status: "Email is required" };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { status: error.message };
  }

  return { status: "OTP resent successfully", data };
}



export async function signInWithGoogle() {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Google sign-in error:", error);
    return { success: false, message: error.message };
  }

  // Return the URL for client-side redirect instead of using redirect()
  return { 
    success: true, 
    message: "Redirecting to Google...", 
    redirectUrl: data?.url 
  };
}