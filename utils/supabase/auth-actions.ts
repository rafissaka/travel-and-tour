/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./server";
import { z } from "zod";


// Add validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export async function login(formData: FormData) {
  const supabase = await createClient(); // Fix double await

  // Validate input data
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  try {
    const validatedData = loginSchema.parse(rawData);
    
    const { error } = await supabase.auth.signInWithPassword(validatedData);

    if (error) {
      // Don't expose internal error messages
      if (error.message.includes('Invalid login credentials')) {
        return { error: "Invalid email or password" };
      }
      return { error: "Login failed. Please try again." };
    }

    return { success: true };
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      return { error: validationError.issues[0].message };
    }
    return { error: "Invalid input data" };
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient();

    // Extract and type-cast input data from formData
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const data = {
      email,
      password,
      options: {
        data: {
          full_name: `${name}`,
          email,
          role,
        },
      },
    };

    // Sign up the user
    const { data: signUpData, error } = await supabase.auth.signUp(data);

    if (error) {
      console.error("Supabase signup error:", error);
      return { error: error.message };
    }

  // User profile will be created via database trigger or webhook
  // No need to manually insert into users table here

    // Revalidate after successful registration
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: error?.message || "Failed to create account" };
  }
}


export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    return { error: error.message };
  }

  return { success: true };
}

