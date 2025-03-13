"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Function to assign role after user creation
async function assignRole(userId: string, tenantId: string, role: "admin" | "member") {
  const supabase = await createClient();
  await supabase.from("users").insert({ id: userId, tenant_id: tenantId, role });
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Extract user input
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Create user in Supabase auth
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    redirect("/error");
  }

  // Create a new tenant for this admin user
  const { data: tenantData, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name: `${email}'s Organization` })
    .select("id")
    .single();

  if (tenantError || !tenantData?.id) {
    redirect("/error");
  }

  // Assign role as "admin"
  await assignRole(data.user.id, tenantData.id, "admin");

  revalidatePath("/", "layout");
  redirect("/");
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function loginWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });

  if (error) {
    redirect("/error");
  }

  if (data?.url) {
    redirect(data.url);
  }
}

// Handle Google auth callback and assign role
export async function handleGoogleCallback(userId: string, email: string) {
  const supabase = await createClient();

  // Check if user already exists in "users" table
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existingUser) {
    // Find an existing tenant or create a default one
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .limit(1)
      .single();

    const tenantId = tenant?.id || (await supabase.from("tenants").insert({ name: "Default Organization" }).select("id").single()).data?.id;

    if (!tenantId) {
      redirect("/error");
    }

    // Assign new Google user as "member"
    await assignRole(userId, tenantId, "member");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
