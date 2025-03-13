import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { userId, newRole } = await req.json();

  // Ensure only admins can update roles
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await supabase.from("users").update({ role: newRole }).eq("id", userId);
  return NextResponse.json({ success: true });
}
